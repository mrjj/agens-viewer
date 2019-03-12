const getHomeHandler = (config) => async (req, res) => {
  res.send(config);
};

module.exports = getHomeHandler;
