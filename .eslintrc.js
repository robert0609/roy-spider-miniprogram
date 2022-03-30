module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": "./"
  },
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "process": "readonly"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/no-parameter-properties": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/interface-name-prefix": ["error", { "prefixWithI": "always" }],
    "@typescript-eslint/explicit-function-return-type": "off"
  }
};
