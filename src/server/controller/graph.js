const ag = require('agensgraph');

const {
  DEFAULT_CONF,
  DEFAULT_QUERY,
  POOL_RECONNECT_INTERVAL_MS,
  STATUS_ERROR,
  STATUS_SUCCESS,
} = require('../contants');

// Module-level variables
let globalCypherQueryCounter = 0;
let pollReconnectInterval = null;
let conf = {};
let pool;

// Init functions
const onPoolError = (err) => {
  process.stderr.write(`Unexpected error on idle client: ${err.message} ${err.stack}`);
  pool.close();
  pollReconnectInterval = setInterval(initPool, POOL_RECONNECT_INTERVAL_MS);
};

const initPool = (conf) => {
  if (pool) {
    pool.off('error', onPoolError);
  }
  pool = new ag.Pool(conf);
  pool.on('error', onPoolError);
  if (pollReconnectInterval) {
    clearInterval(pollReconnectInterval);
    pollReconnectInterval = null;
  }
};

const init = () => {
  const envConf = {
    graphName: process.env.AGENS_GRAPH_NAME,
    port: process.env.AGENS_PORT,
    host: process.env.AGENS_HOST,
    user: process.env.AGENS_USER,
    password: process.env.AGENS_PASSWORD,
    database: process.env.AGENS_DATABASE,
  };
  Object.keys(DEFAULT_CONF)
    .sort()
    .forEach(k => {
      conf[k] = (typeof envConf[k] === 'undefined' ? DEFAULT_CONF : envConf)[k];
    });
  const configKeys = Object.keys(conf)
    .filter(k => k !== 'password')
    .sort()
    .map(k => `${k}: ${conf[k]}`);
  process.stdout.write(`${configKeys.join('\n')}\n`);
  if (!pool) {
    initPool(conf);
  }
};

// Query functions
const pgClientQueryAsync = async (q, options = []) => {
  globalCypherQueryCounter += 1;
  return new Promise(async (resolve, reject) => {
    let client;
    try {
      client = await pool.connect();
    } catch (e) {
      reject(e);
    }
    const q1 = `CREATE GRAPH IF NOT EXISTS ${conf.graphName}; SET graph_path = ${conf.graphName} ;`;
    const onError = (e) => {
      client.release();
      reject(e);
    };
    const onSuccess = (res) => {
      client.release();
      resolve(res);
    };
    const qFn = () => client.query(q, options, (e, res) => {
      if (e) {
        onError(e);
      } else {
        onSuccess(res);
      }
    });
    client.query(q1, [], (e1) => {
      if (e1) {
        onError(e1);
      }
      qFn();
    });
  });
};

init();

const makeQuery = async (req, res) => {
  try {
    const result = await pgClientQueryAsync(
      (req.query.query || '').replace(/\n/g, ' \n') || DEFAULT_QUERY,
    );
    res.json(Object.assign({ status: STATUS_SUCCESS }, result));
  } catch (e) {
    process.stderr.write(`Error: ${e.message}\n${e.stack}\n`);
    res.json({
      errors: [
        {
          code: e.code,
          message: e.message,
          stack: e.stack,
          position: e.position,
          line: e.line,
        },
      ],
      status: STATUS_ERROR,
    });
  }
};

module.exports = makeQuery;
