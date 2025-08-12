/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { languageOptions: { ecmaVersion: "latest", sourceType: "module" } },
  { files: ["**/*.js"], rules: { "no-unused-vars": "warn" } }
];
