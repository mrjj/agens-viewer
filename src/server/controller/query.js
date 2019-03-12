const getDb = require('../db');
const { API_RESPONSE_CODES } = require('../../contants');

const getGraphHandler = (config) => async (req, res) => {
  try {
    const makeQuery = getDb();
    const query = req.body;
    console.log(query)
    const result = await makeQuery(
      (query || '').replace(/\n/g, ' \n') || config.DEFAULT_QUERY,
    );
    res.json(Object.assign({ status: API_RESPONSE_CODES.SUCCESS }, result));
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
      status: API_RESPONSE_CODES.ERROR,
    });
  }
};

module.exports = getGraphHandler;
