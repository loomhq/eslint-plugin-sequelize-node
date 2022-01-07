'use strict';

const rule = require('../lib/rules/no-allow-null-true'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('no-allow-null-true', rule.testFn, {
  valid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', {})`,
      options: [],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', { allowNull: true, defaultValue: 'foo' })`,
      options: [],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', { defaultValue: 'foo', references: { model: 'Posts', key: 'post_id' } })`,
      options: [],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { type: 'TEXT' })`,
      options: [],
    },
  ],

  invalid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', { allowNull: false, references: { model: 'Posts', key: 'post_id' } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', { allowNull: false, defaultValue: 'foo', references: { model: 'Posts', key: 'post_id' } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { allowNull: false })`,
      errors: [{ message: rule.reportMessage }],
    },
  ],
});
