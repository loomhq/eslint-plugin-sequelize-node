const reportMessage = `
Adding new JSONB columns can lead to performance issues on the Database.
Avoid adding new JSONB columns in the schema.

If you need to store JSON data, consider other storage options or review
your schema design to avoid using JSONB columns.
`;

const testFn = (context) => ({
  CallExpression(node) {
    if (!node.callee.property) {
      return;
    }

    if (node.callee.property.name === 'createTable') {
      const columnOptions = node.arguments[1].properties;

      for (let column of columnOptions) {
        if (column.value && column.value.properties) {
          for (let columnsAttribute of column.value.properties) {
            if (columnsAttribute.key.name === 'type' &&
                columnsAttribute.value.type === 'MemberExpression' &&
                columnsAttribute.value.object.name === 'Sequelize' &&
                columnsAttribute.value.property.name === 'JSONB') {
              context.report(columnsAttribute, reportMessage);
            }
          }
        }
      }
    }

    if (
      node.callee.property.name === 'addColumn' ||
      node.callee.property.name === 'changeColumn'
    ) {
      if (node.arguments.length < 3) {
        return;
      }
      if (node.arguments[2].type !== 'ObjectExpression') {
        return;
      }
      const columnOptions = node.arguments[2].properties;
      const typeProps = columnOptions.find(
        (item) => item.key.name === 'type' &&
                  item.value.type === 'MemberExpression' &&
                  item.value.object.name === 'Sequelize' &&
                  item.value.property.name === 'JSONB'
      );

      if (typeProps) {
        context.report(node.arguments[2], reportMessage);
      }
    }
  },
});

module.exports = {
  reportMessage,
  testFn,
};
