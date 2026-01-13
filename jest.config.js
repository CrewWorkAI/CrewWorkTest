module.exports = {
  testEnvironment: 'node',
  // Use plain JS tests; no preset required.
  transform: {
    '\\.ts$': ['ts-jest', {}],
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['js', 'ts'],
  collectCoverageFrom: ['**/*.js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  testPathIgnorePatterns: ['/integration.test.js', '/e2e/', '/node_modules/'],
};
