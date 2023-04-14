const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Takes dataToUpdate which is an object that contains only
 * the data that we want to update as first argument.
 * {firstName: 'Aliya', age: 32}
 *
 * As a second argument, it takes jsToSql, which is an object with keys that have
 * a value of the key name converted from camel case to snake case.
 * { firstName: 'first_name' }
 *
 * Returns an object with a key of setCols which equals the name
 * of the columns that are being changed, with each column equal
 * to the corresponding values in the values key.
 *
 * { setCols: '"first_name"=$1, "age"=$2', values: [ 'Aliya', 32 ] }
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']

  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Takes object with option filter values:
 * { nameLike: "fakeCo", minEmployees: "2", maxEmployees: "98"}
 *
 * Returns an object with WHERE clause and parameterized values:
 *  {
 *   clause: "WHERE name ILIKE '%$1%' AND num_employees >= $2 AND num_employees <= $1",
 *   values: [ 'fakeCo', '2', '98' ]
 *  }
 *
 * If maxEmployees < minEmployees, throw 400 error
 */
function generateSqlWhereClause(filters) {
  const { nameLike, minEmployees, maxEmployees } = filters;
  ///TODO account for undefined eg 0
  if ((maxEmployees !== undefined && minEmployees !== undefined)
       && (maxEmployees < minEmployees)) {
    throw new BadRequestError('maxEmployees cannot exceed minEmployees')
  };
  // FIXME: truthy falsy stuff
  let clause = (nameLike !== undefined ||
                minEmployees !== undefined ||
                maxEmployees !== undefined) ? 'WHERE ' : "";

  const values = [];

  if (nameLike !== undefined) {
    values.push(`%${nameLike}%`);
    clause += `name ILIKE $1`
    if (minEmployees || maxEmployees) {
      clause += ` AND `
    }
  }

  if (minEmployees !== undefined) {
    values.push(minEmployees);
    const placeholder = nameLike ? '$2' : '$1';
    clause += `num_employees >= ${placeholder}`
    if (maxEmployees) {
      clause += ` AND `
    }
  }

  if (maxEmployees !== undefined) {
    values.push(maxEmployees);
    clause +=
      `num_employees <= $${Object.keys(filters).length}`;
  }

  return { clause, values };
}


module.exports = { sqlForPartialUpdate, generateSqlWhereClause };
