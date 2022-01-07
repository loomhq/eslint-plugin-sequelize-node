'use strict';

const rule = require('../lib/rules/always-not-valid-foreign-key'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('always-not-valid-foreign-key', rule.testFn, {
  valid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', { allowNull: false })`,
      options: [],
    },
    {
      code: `queryInterface.addColumn('Table', 'Column', 'String')`,
      options: [],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { allowNull: false, defaultValue: 'foo' })`,
      options: [],
    },
    {
      code: `queryInterface.addConstraint('Table', 'Column', { fields: ['username'] })`,
      options: [],
    },
    {
      code: `queryInterface.createTable('level', { createdAt: Sequelize.DATE, id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }})`,
      options: [],
    },
  ],

  invalid: [
    {
      code: `queryInterface.addColumn('Table', 'Column', { allowNull: false, references: { model: 'Posts', key: 'post_id' } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.changeColumn('Table', 'Column', { allowNull: false, defaultValue: 'foo', references: { model: 'Posts', key: 'post_id' } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.addConstraint('Table', 'Column', { fields: ['username'], references: { table: 'users', field: 'username' } })`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.createTable('level', { id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, user_id: { references: { model: 'level', key: 'id' } } })`,
      errors: [{ message: rule.reportMessage }],
    },
  ],
});
