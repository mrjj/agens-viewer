const { API_RESPONSE_CODES } = require('../../contants');

const getConfigHandler = (config) => async (req, res) => {
  res.json({
    config,
    status: API_RESPONSE_CODES.ERROR,
  });
};

module.exports = getConfigHandler;
