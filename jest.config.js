module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|tsx)'],
  testPathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
    'polymesh-types/(.*)': '<rootDir>/src/polkadot/$1',
  },
};
