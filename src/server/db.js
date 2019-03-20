const ag = require('agensgraph');
const { HIDDEN_AGENS_CONFIG_FIELDS } = require('../contants');

// Module-level variables
let GLOBAL_CONFIG = {};
let GLOBAL_CONNECTIONS_POOL = null;

/**
 * Initialize db pool idempotent way
 * @param config
 * @return {*}
 */
const initPool = (config) => {
  let pollReconnectInterval = null;

  // Init functions
  const onPoolError = (err) => {
    process.stderr.write(`Unexpected error on idle client: ${err.message} ${err.stack}`);
    if (GLOBAL_CONNECTIONS_POOL) {
      GLOBAL_CONNECTIONS_POOL.close();
    }
    pollReconnectInterval = setInterval(initPool, GLOBAL_CONFIG.poolReconnectIntervalMs);
  };

  if (GLOBAL_CONNECTIONS_POOL) {
    GLOBAL_CONNECTIONS_POOL.off('error', onPoolError);
  }
  GLOBAL_CONNECTIONS_POOL = new ag.Pool(config);
  GLOBAL_CONNECTIONS_POOL.on('error', onPoolError);
  if (pollReconnectInterval) {
    clearInterval(pollReconnectInterval);
    pollReconnectInterval = null;
  }
  return GLOBAL_CONNECTIONS_POOL;
};

/**
 * Query Db
 * @param poolObj
 * @param q
 * @param options
 * @return {Promise<*>}
 */
const agensQueryAsync = async (poolObj, q, options = []) => {
  if (!poolObj) {
    throw new Error('No Pool object is defined');
  }
  poolObj.queryCounter = (poolObj.queryCounter || 0) + 1;

  return new Promise(async (resolve, reject) => {
    let client;
    try {
      client = await poolObj.connect();
    } catch (e) {
      reject(e);
    }
    const q1 = [
      `CREATE GRAPH IF NOT EXISTS ${GLOBAL_CONFIG.graphName};`,
      `SET graph_path = ${GLOBAL_CONFIG.graphName} ;`,
    ].join('\n');
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
    if (client) {
      client.query(q1, [], (e1) => {
        if (e1) {
          onError(e1);
        }
        qFn();
      });
    } else {
      console.error('Client is failed')
    }
  });
};

/**
 * Get query function using initialized connection
 * @param config
 * @return {function(*=, *=): Promise<*>}
 */
const getDb = (config) => {
  GLOBAL_CONFIG = config || GLOBAL_CONFIG;
  const configKeyStrings = Object.keys(GLOBAL_CONFIG)
    .filter(k => HIDDEN_AGENS_CONFIG_FIELDS.indexOf(k) === -1)
    .sort()
    .map(k => `  ${k}: ${GLOBAL_CONFIG[k]}`);
  if (!GLOBAL_CONNECTIONS_POOL) {
    process.stdout.write([
      `AgensGraph connection config:`,
      ...configKeyStrings,
      '',
    ].join('\n'));
    initPool(GLOBAL_CONFIG);
  }
  return (q, options) => agensQueryAsync(GLOBAL_CONNECTIONS_POOL, q, options);
};

module.exports = getDb;
