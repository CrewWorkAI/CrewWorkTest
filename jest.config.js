module.exports = {
  testEnvironment: 'node',
  // Use plain JS tests; no preset required.
  transform: {},
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: ['**/*.js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  testPathIgnorePatterns: ['/integration.test.js', '/e2e/', '/node_modules/'],
};
