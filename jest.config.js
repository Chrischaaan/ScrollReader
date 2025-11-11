module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testPathIgnorePatterns: ['./node_modules/', './dist/'],
  transform: { '^.+\\.ts$': 'jest-preset-angular' },
  transformIgnorePatterns: [
    '/node_modules/(?!flat)/', // Exclude modules except 'flat' from transformation
  ],
  moduleNameMapper: {
    '@sr(.*)': '<rootDir>/src/$1',
  },
};
