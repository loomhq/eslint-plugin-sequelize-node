const reportMessage = `
Adding or dropping indices with raw SQL MUST include the "CONCURRENTLY" keyword.
This is necessary to reduce locking of the target table.`;

const testFn = (context) => ({
  CallExpression(node) {
    if (node.callee.property && node.callee.property.name === 'query') {
      if (node.arguments.length !== 1) {
        return;
      }

      let rawSql = null;
      if (node.arguments[0].type === 'Literal') {
        rawSql = node.arguments[0].value;
      }

      if (node.arguments[0].type === 'TemplateLiteral') {
        rawSql = node.arguments[0].quasis.map(q => q.value.cooked).join(' ')
      }

      // Couldn't pluck out the raw query so it might not have one.
      if (!rawSql) {
        return;
      }

      const commands = rawSql.split(' ');
      let command = commands.shift().toUpperCase();
      if (command !== 'CREATE' && command !== 'DROP') {
        return;
      }

      command = commands.shift().toUpperCase();
      if (command === 'UNIQUE') {
        command = commands.shift();
      }

      if (command !== 'INDEX') {
        return;
      }

      command = commands.shift().toUpperCase();
      if (command !== 'CONCURRENTLY') {
        context.report(node.arguments[0], reportMessage);
      }
    }
  },
});

module.exports = {
  reportMessage,
  testFn,
};
