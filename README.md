# eslint-plugin-sequelize-node

Collection of custom linting rules for [Sequelize](https://www.npmjs.com/package/sequelize) NodeJS

## Installation

`yarn add eslint-plugin-sequelize-node`

## Configuration

```json
{
  "extends": [],
  "rules": {
    "sequelize-node/no-allow-null-true": "error"
  },
  "env": {},
  "plugins": ["sequelize-node"]
}
```

## Rules

### no-allow-null-true

Adding a non nullable constraint on a column leads to PG acquiring a
lock on the table while it validates the constraint. On larger tables,
this can result in lock contention and other issues on the Database.

As an alternative you can write a raw SQL to safely add, validate
without PG having to block writes while the constraint is being added.

The following shows how you can add the constraint on an existing column.
If you are adding a new column (via addColumn) with allowNull: false,
best to add the column first, then add the constraint of NOT NULL safely,
like mentioned below using the four statements:

```sql
1. ALTER TABLE $table-name ADD CONSTRAINT $constraint-name CHECK ($column-name IS NOT NULL) NOT VALID;

2. ALTER TABLE $table-name validate CONSTRAINT $constraint-name; -- performs seq scan but doesn't block read/writes.

3. ALTER TABLE $table-name ALTER COLUMN workspace SET NOT NULL;

4. ALTER TABLE $table-name DROP CONSTRAINT $constraint-name;
```

NOTE: Depending on the size of the table, the `validate` instruction
can take a while.

### require-concurrently

Requires that an index created or dropped via raw SQL to include the 'CONCURRENTLY'
keyword to avoid excessive locking.

### no-remove-index

Using `removeIndex` does not allow setting `concurrently: true` as an option for removing the index.
For that reason, this rule would disallow usage of this function in favor for a raw SQL query with
`CONCURRENTLY`:

```sql
DROP INDEX CONCURRENTLY IF EXISTS my_index
```

### always-not-valid-foreign-key

Do not use references as part of `addColumn`, `changeColumn`,`addConstraint` or
`createTable`. Instead use raw SQL to add foreign key/references to a column with
a `NOT VALID`.

`NOT VALID` on an `ALTER` statement for foreign key does not
block writes against the referred table, thus making it a
safer operation to run on large production tables. You
can manually run VALIDATE CONSTRAINT if you desire.

For `createTable` its preferrable to add the column first, then
using queryInterface.query add the constraint using raw SQL.

Example:
```sql
ALTER TABLE "users" ADD FOREIGN KEY ("level_id") REFERENCES "level" ("id") NOT VALID;

```

### no-jsonb-column

Adding new JSONB columns can lead to performance issues on the Database.

If you need to store JSON data, consider other storage options or review your schema design to avoid using JSONB columns.

Example:
```javascript
// Invalid usage
queryInterface.addColumn('Table', 'Column', { type: Sequelize.JSONB });
queryInterface.changeColumn('Table', 'Column', { type: Sequelize.JSONB });
queryInterface.createTable('Table', { Column: { type: Sequelize.JSONB } });

// Valid usage
queryInterface.addColumn('Table', 'Column', { type: Sequelize.INTEGER });
queryInterface.changeColumn('Table', 'Column', { type: Sequelize.BOOLEAN });
queryInterface.createTable('Table', { Column1: { type: Sequelize.DATE }, Column2: { type: Sequelize.INTEGER } });


## Local development

**Tests**

```

yarn test

```

**Prettier**

```

yarn pretty

```

## Deployment / release

- Bump `version` in `package.json`, create a PR and merge it to `main`
- Tag and push from `main`
  - `git checkout main && git pull`
  - `git tag v<$version>` (same `version` as in `package.json`). Example: `git tag v0.1.0`
  - `git push --tags origin`
- A CI build will trigger and publish the version.
  - You should see a new pipeline in CI with a `publish` job.
```
