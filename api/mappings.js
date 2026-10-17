// Vercel Serverless Mappings API Handler
const server = require('../server');

module.exports = (req, res) => {
  server.emit('request', req, res);
};
