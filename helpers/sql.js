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

module.exports = { sqlForPartialUpdate };
