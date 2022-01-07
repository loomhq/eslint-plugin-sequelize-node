const reportMessage = `
Do not use references as part of addColumn, changeColumn, addConstraint or
createTable. Instead use raw SQL to add foreign key/references to a column with
a NOT VALID. 

NOT VALID on an ALTER statement for foreign key does not
block writes against the referred table, thus making it a
safer operation to run on large production tables. You
can manually run VALIDATE CONSTRAINT if you desire. 

For createTable its preferrable to add the column first, then
using queryInterface.query add the constraint using raw SQL.

Example:
ALTER TABLE "users" ADD FOREIGN KEY ("level_id") REFERENCES "level" ("id") NOT VALID;

There is a feature request open on Sequelize to support notValid: true
as part of the DSL: https://github.com/sequelize/sequelize/issues/13905
`;

const testFn = (context) => ({
  CallExpression(node) {
    if (!node.callee.property) {
      return;
    }

    // This iterates over the 2nd attribute (pos 1 in an array)
    // for the createTable API which is a array of columns
    // as an object. For each column if it has a foreign key,
    // it will have a references key in it. That is what this
    // nested loop is looking for. Example:
    // queryInterface.createTable('level', { <- arguments[1]
    //   id: { <- columns
    //     type: DataTypes.INTEGER, <- data types [0]
    //     primaryKey: true,  <- data type [1]
    //    autoIncrement: true  <- data type [2]
    //    references: {} <- data type 3
    //        \-> key->name
    //....
    if (node.callee.property.name === 'createTable') {
      const columnOptions = node.arguments[1].properties;
      for (let column of columnOptions) {
        if (column.value && column.value.properties) {
          for (let columnsAttribute of column.value.properties) {
            if (columnsAttribute.key.name === 'references') {
              context.report(columnsAttribute, reportMessage);
            }
          }
        }
      }
    }

    if (
      node.callee.property.name === 'addColumn' ||
      node.callee.property.name === 'changeColumn' ||
      node.callee.property.name === 'addConstraint'
    ) {
      if (node.arguments.length < 3) {
        return;
      }
      if (node.arguments[2].type !== 'ObjectExpression') {
        return;
      }
      const columnOptions = node.arguments[2].properties;
      const referencesProps = columnOptions.find(
        (item) => item.key.name === 'references',
      );

      if (referencesProps) {
        context.report(node.arguments[2], reportMessage);
      }
    }
  },
});

module.exports = {
  reportMessage,
  testFn,
};
