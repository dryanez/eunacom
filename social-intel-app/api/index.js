// Vercel serverless entrypoint. server.js exports the Express app when it is
// required rather than run directly, so the platform can drive it as a handler.
module.exports = require("../server.js");
