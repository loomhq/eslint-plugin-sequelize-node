const reportMessage = `
Do not use allowNull: false. Adding a non nullable constraint on a column 
leads to PG acquiring a lock on the table while it validates the constraint.
On larger tables, this can result in lock contention and other issues on the Database.

As an alternative you can write a raw SQL to safely add, validate
without PG having to block writes while the constraint is being added.

The following shows how you can add the constraint on an existing column.
If you are adding a new column (via addColumn) with allowNull: false,
best to add the column first, then add the constraint of NOT NULL safely,
like mentioned below.

ALTER TABLE $table-name ADD CONSTRAINT $constraint-name CHECK ($column-name IS NOT NULL) NOT VALID;

ALTER TABLE $table-name validate CONSTRAINT $constraint-name; -- performs seq scan but doesn't block read/writes.

ALTER TABLE $table-name ALTER COLUMN workspace SET NOT NULL;

ALTER TABLE $table-name DROP CONSTRAINT $constraint-name;
`;

const testFn = (context) => ({
  CallExpression(node) {
    if (
      node.callee.property &&
      (node.callee.property.name === 'addColumn' ||
        node.callee.property.name === 'changeColumn')
    ) {
      if (node.arguments.length < 3) {
        return;
      }
      if (node.arguments[2].type !== 'ObjectExpression') {
        return;
      }
      const columnOptions = node.arguments[2].properties;
      const allowNullProps = columnOptions.find(
        (item) => item.key.name === 'allowNull',
      );

      if (allowNullProps && allowNullProps.value.value === false) {
        context.report(node.arguments[2], reportMessage);
      }
    }
  },
});

module.exports = {
  reportMessage,
  testFn,
};
