/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js"],
  reporters: ["default", ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }]],
  transform: {}
};
