/**
 * Vercel serverless entry: all requests are routed here via vercel.json rewrites.
 * The Express app is the handler; run "node server.js" locally for a normal server.
 */
module.exports = require('../server');
