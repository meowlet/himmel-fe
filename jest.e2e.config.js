module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/e2e/**/*.test.(ts|js)"],
  moduleFileExtensions: ["ts", "js", "json"],
  testTimeout: 30000,
};
