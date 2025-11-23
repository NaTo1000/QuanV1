module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app.js',
    '!index.js',
    '!jest.config.js',
    '!eslint.config.js',
    '!coverage/**'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true
};
