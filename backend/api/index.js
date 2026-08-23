const { createServer } = require('@vercel/node');
const app = require('../src/index');

module.exports = createServer(app);
