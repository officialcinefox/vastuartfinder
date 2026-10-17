// Vercel Serverless Catch-All API Handler
const server = require('../server');

module.exports = (req, res) => {
  server.emit('request', req, res);
};
