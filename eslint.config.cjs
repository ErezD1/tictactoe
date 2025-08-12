/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  { languageOptions: { ecmaVersion: "latest", sourceType: "module" } },
  { files: ["**/*.js"], rules: { "no-unused-vars": "warn" } }
];
