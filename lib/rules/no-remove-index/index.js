const reportMessage = `
Do not use removeIndex. Instead, write a raw SQL query that includes the
CONCURRENTLY keyword (for example, DROP INDEX CONCURRENTLY IF NOT EXISTS).

This is because removeIndex does not have an option for including the
CONCURRENTLY keyword. For more details, check out
https://www.postgresql.org/docs/9.3/sql-dropindex.html

There is a feature request open on Sequelize to support concurrently: true
as part of the DSL: https://github.com/sequelize/sequelize/issues/13901
`;

const testFn = (context) => ({
  CallExpression(node) {
    if (node.callee.property && node.callee.property.name === 'removeIndex') {
      context.report(node, reportMessage);
    }
  },
});

module.exports = {
  reportMessage,
  testFn,
};
