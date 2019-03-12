const path = require('path');

/**
 * Common constants
 */
const MS_IN_S = 1000;

/**
 * Server config
 */
const DEFAULT_SERVER_CONFIG = {
  SCHEMA: 'http',
  HOST: '0.0.0.0',
  PORT: '1313',
  STATIC_PATH: path.resolve(path.join(__dirname, '..', 'dist')),
  HEALTH_CHECK_QUERY: 'SELECT 13',
  DEFAULT_QUERY: 'SHOW graph_path',
};

/**
 * API CONFIG
 */
const API_RESPONSE_CODES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const API_ENDPOINTS = {
  HOME: '/',
  QUERY: '/query',
  CONFIG: '/config',
};

/**
 * AgensGraph connection config
 */
const DEFAULT_AGENS_CONFIG = {
  graphName: 'agens_graph',
  port: 5432,
  host: '0.0.0.0',
  user: 'agens',
  password: '',
  database: 'agens',
  poolReconnectIntervalMs: 2 * MS_IN_S,
};

const AGENS_CONFIG_TO_ENV_VARS_MAP = {
  graphName: 'AGENS_GRAPH_NAME',
  port: 'AGENS_PORT',
  host: 'AGENS_HOST',
  user: 'AGENS_USER',
  password: 'AGENS_PASSWORD',
  database: 'AGENS_DATABASE',
  pollReconnectIntervalMs: 'AGENS_POLL_RECONNECT_INTERVAL_MS',
  defaultQuery: 'AGENS_DEFAULT_QUERY',
  healthCheckQuery: 'AGENS_HEALTH_CHECK_QUERY',
};

const HIDDEN_AGENS_CONFIG_FIELDS = ['password'];

/**
 * UI Config
 */

const UI = {
  DEFAULT_COLOR_INTENSITY: 500,
  SCHEMA_FONT_SIZE: 10,
};

module.exports = {
  API_ENDPOINTS,
  API_RESPONSE_CODES,
  AGENS_CONFIG_TO_ENV_VARS_MAP,
  DEFAULT_AGENS_CONFIG,
  DEFAULT_SERVER_CONFIG,
  HIDDEN_AGENS_CONFIG_FIELDS,
  UI,
};
