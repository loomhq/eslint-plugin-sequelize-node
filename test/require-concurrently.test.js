'use strict';

const rule = require('../lib/rules/require-concurrently'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('require-concurrently', rule.testFn, {
  valid: [
    // unrelated cases
    {
      code: `queryInterface.sequelize.query('CREATE EXTENSION hello')`,
      options: [],
    },
    // raw create index
    {
      code: `queryInterface.sequelize.query('CREATE UNIQUE INDEX CONCURRENTLY ' +
                'IF NOT EXISTS "my_cool_index" ' +
                'ON my_awesome_table("id", "status") ' +
                'WHERE "status" IS NULL')`,
      options: [],
    },
    {
      code: `queryInterface.sequelize.query("CREATE INDEX CONCURRENTLY idx ON table (rank ASC NULLS LAST);")`,
      options: [],
    },
    // raw drop index
    {
      code: `queryInterface.sequelize.query("DROP INDEX CONCURRENTLY IF EXISTS idx")`,
      options: [],
    },
    // ORM add index
    {
      code: `queryInterface.addIndex(TABLE_NAME, {
                fields: ['video_id'],
                concurrently: true,
            });`,
      options: [],
    },
    {
      code: "queryInterface.sequelize.query(`CREATE INDEX CONCURRENTLY idx ON table (rank ASC NULLS LAST)`)",
      parserOptions: { ecmaVersion: 6 },
    },
  ],

  invalid: [
    {
      code: `queryInterface.sequelize.query("CREATE INDEX idx ON table (rank ASC NULLS LAST)")`,
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: "queryInterface.sequelize.query(`CREATE INDEX idx ON table (rank ASC NULLS LAST)`)",
      parserOptions: { ecmaVersion: 6 },
      errors: [{ message: rule.reportMessage }],
    },
    {
      code: `queryInterface.sequelize.query("DROP INDEX IF EXISTS idx")`,
      errors: [{ message: rule.reportMessage }],
    },
  ],
});
