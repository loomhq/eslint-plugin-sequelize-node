'use strict';

const rule = require('../lib/rules/no-remove-index'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('no-remove-index', rule.testFn, {
  valid: [
    {
      code: `queryInterface.addColumn(
            "table",
            "column",
            {
              type: Sequelize.TEXT,
              allowNull: false,
            }
          );`,
      options: [],
    },
  ],

  invalid: [
    {
      code: `queryInterface.removeIndex("table", ["column"])`,
      errors: [{ message: rule.reportMessage }],
    },
  ],
});
