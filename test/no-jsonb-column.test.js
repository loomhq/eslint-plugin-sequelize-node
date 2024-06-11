'use strict';

const rule = require('../lib/rules/no-jsonb-column'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('no-jsonb-column', rule.testFn, {
  valid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', { type: Sequelize.DATE })`,
      options: [],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', { type: Sequelize.INTEGER })`,
      options: [],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { type: Sequelize.UUID })`,
      options: [],
    },
    {
      code: `queryInterface.createTable('Table', { Column1: { type: Sequelize.INTEGER }, Column2: { type: Sequelize.INTEGER } })`,
      options: [],
    },
  ],

  invalid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', { type: Sequelize.JSONB })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', { type: Sequelize.JSONB, defaultValue: {} })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { type: Sequelize.JSONB })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.createTable('Table', { Column: { type: Sequelize.JSONB } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.createTable('Table', { Column1: { type: Sequelize.STRING }, Column2: { type: Sequelize.JSONB } })`,
      errors: [{ message: rule.reportMessage }],
    },
  ],
});
