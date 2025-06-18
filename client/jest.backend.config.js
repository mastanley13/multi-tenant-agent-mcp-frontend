module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  setupFilesAfterEnv: [],
} 