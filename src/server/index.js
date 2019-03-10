const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');

const home = require('./controller/home');
const graph = require('./controller/graph');

const SCHEMA = process.env.SCHEMA || 'http';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 7001;
const app = express();

const staticOptions = {
  dotfiles: 'ignore',
  etag: false,
  maxAge: '1d',
  redirect: false,
  'index': ['index.html', 'index.htm'],
  setHeaders: (res, path, stat) => {
    res.set('x-timestamp', Date.now());
  }
};
const staticPath = path.resolve(path.join(__dirname, '..', 'public'));
app.use(serveStatic(staticPath, staticOptions));

app.get('/', home);
app.get('/graph', graph);

app.listen(PORT, () => {
  process.stdout.write(`AgensGraph viewer started
  - address:      ${SCHEMA ? `${SCHEMA}://` : ''}${HOST}${PORT ? `:${PORT}` : ''}
  - static path:  ${staticPath}\n`);
});
