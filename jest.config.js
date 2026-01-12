module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  collectCoverageFrom: ['**/*.tsx'],
  testMatch: ['**/?(*.)+(spec|test).[tj]sx?'],
};
