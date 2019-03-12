const express = require('express');
const serveStatic = require('serve-static');

const { isUndefined, isObject } = require('./utils');
const getDb = require('./db');
const getHomeHandler = require('./controller/home');
const getQueryHandler = require('./controller/query');
const getConfigHandler = require('./controller/config');

const {
  AGENS_CONFIG_TO_ENV_VARS_MAP,
  API_ENDPOINTS,
  DEFAULT_AGENS_CONFIG,
  DEFAULT_SERVER_CONFIG,
} = require('../contants');

const init = (userServerConfig, userAgensConfig) => {
  process.stdout.write('Starting AgensGraph Viewer...');
  const app = express();
  const serverConfig = {};
  const agensConfig = {};

  Object.keys(DEFAULT_SERVER_CONFIG).sort().forEach(
    (k) => {
      if (isObject(userServerConfig) && (!isUndefined(userServerConfig[k]))) {
        serverConfig[k] = userServerConfig[k];
      } else {
        const envVal = process.env[k];
        serverConfig[k] = isUndefined(envVal) ? DEFAULT_SERVER_CONFIG[k] : envVal;
      }
    },
  );

  Object.keys(DEFAULT_AGENS_CONFIG).sort().forEach(
    (k) => {
      if (isObject(userAgensConfig) && (!isUndefined(userAgensConfig[k]))) {
        agensConfig[k] = userAgensConfig[k];
      } else {
        const envVal = process.env[AGENS_CONFIG_TO_ENV_VARS_MAP[k]];
        agensConfig[k] = isUndefined(envVal) ? DEFAULT_AGENS_CONFIG[k] : envVal;
      }
    },
  );

  const staticOptions = {
    dotfiles: 'ignore',
    etag: false,
    maxAge: '1d',
    redirect: false,
    index: ['index.html'],
    setHeaders: (res, path, stat) => {
      res.set('x-timestamp', Date.now());
    },
  };
  app.use(serveStatic(serverConfig.STATIC_PATH, staticOptions));

  app.post(API_ENDPOINTS.HOME, getHomeHandler(serverConfig));
  app.post(API_ENDPOINTS.QUERY, getQueryHandler(serverConfig));
  app.post(API_ENDPOINTS.CONFIG, getConfigHandler(serverConfig));

  app.listen(serverConfig.PORT, () => {
    const schemaStr = serverConfig.SCHEMA ? `${serverConfig.SCHEMA}://` : '';
    const portStr = serverConfig.PORT ? `:${serverConfig.PORT}` : '';
    process.stdout.write(
      `AgensGraph Viewer started
  - address:      ${schemaStr}${serverConfig.HOST}${portStr}
  - static path:  ${serverConfig.STATIC_PATH}\n`);
  });

  getDb(agensConfig);
};

if (require.main === module) {
  init();
}

module.exports = init;
