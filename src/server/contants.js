const DEFAULT_QUERY = 'SHOW graph_path;';

const DEFAULT_CONF = {
  graphName: 'agens_graph',
  port: 5432,
  host: '0.0.0.0',
  user: 'agens',
  password: '',
  database: 'agens',
};

const POOL_RECONNECT_INTERVAL_MS = 2000;

const STATUS_ERROR = 'ERROR';
const STATUS_SUCCESS = 'SUCCESS';

module.exports = {
  DEFAULT_CONF,
  DEFAULT_QUERY,
  POOL_RECONNECT_INTERVAL_MS,
  STATUS_ERROR,
  STATUS_SUCCESS
};
