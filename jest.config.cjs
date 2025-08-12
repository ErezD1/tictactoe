/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "node",
  // Treat .js files as ESM (your source and tests use `import`)
  extensionsToTreatAsEsm: [".js"],
  collectCoverageFrom: ["src/**/*.js"],
  // Keep reports for Jenkins
  reporters: ["default", ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }]],
  // No transforms needed; pure ESM JS
  transform: {}
};
