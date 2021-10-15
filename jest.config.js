module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!index.js',
    '!**/*.test.js',
    '!**/*.config.js',
    '!gulpfile.js'
  ],
  coverageDirectory: 'test-output',
  coveragePathIgnorePatterns: [
    '<rootDir>/back-office/',
    '<rootDir>/bin/',
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '.*/__mocks__/.*'
  ],
  coverageReporters: ['text-summary', 'cobertura', 'lcov'],
  modulePathIgnorePatterns: ['node_modules'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'test-output',
        outputName: 'junit.xml'
      }
    ]
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['test/integration/local', 'test/contract/']
}
