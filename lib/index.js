const noAllowNull = require('./rules/no-allow-null-true');
const requireConcurrently = require('./rules/require-concurrently');
const noRemoveIndex = require('./rules/no-remove-index');
const alwaysNotValidForeignKey = require('./rules/always-not-valid-foreign-key');

module.exports = {
  rules: {
    'no-allow-null-true': {
      create: noAllowNull.testFn,
    },
    'require-concurrently': {
      create: requireConcurrently.testFn,
    },
    'no-remove-index': {
      create: noRemoveIndex.testFn,
    },
    'always-not-valid-foreign-key': {
      create: alwaysNotValidForeignKey.testFn,
    },
  },
};
