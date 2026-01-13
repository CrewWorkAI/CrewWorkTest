// Test shim to expose the TypeScript server implementation to the unit tests.
// Jest resolves '../src/server' from test/unit, which maps to this file
// located in `test/src/server.js`. We use `ts-node` to transpile the
// original TS source at runtime.
require('ts-node/register');
module.exports = require('../../src/server');
