// Runtime entrypoint for tests that expect a CommonJS module.
// It imports the TypeScript server implementation using ts-node/register.
require('ts-node/register');
module.exports = require('./server.ts');
