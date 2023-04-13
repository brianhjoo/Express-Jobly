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
 * Returns entire WHERE sql query:
 * "name ILIKE '%eCo%' AND num_employees > 30 AND num_employess < 250"
 *
 * If maxEmployees < minEmployees, throw 400 error
 */
function generateSqlWhereClause(filters) {

  // if (Object.keys(filters).length === 0) return "";
  const { nameLike, minEmployees, maxEmployees } = filters;

  if ((maxEmployees && minEmployees) && (maxEmployees < minEmployees)) {
    throw new BadRequestError('maxEmployees cannot exceed minEmployees')
  };

  
  let clause = (nameLike || minEmployees|| maxEmployees) ? 'WHERE ': "";

  // nameLike
  if (nameLike) {
    clause +=  `name ILIKE '%${nameLike}%'`
    if (minEmployees || maxEmployees) {
      clause += ` AND `
    }
      // Object.keys.length > 1 ?
      // `name ILIKE '%${nameLike}%' AND ` :
      // `name ILIKE '%${nameLike}%'`
  }

  // minEmployees
  if (minEmployees) {
    clause += `num_employees >= ${minEmployees}`
    if (maxEmployees) {
      clause += ` AND `
    }
  }

  // maxEmployees
  if (maxEmployees) {
    clause +=
      `num_employees <= ${maxEmployees}`;
  }

  return clause;
}

module.exports = { sqlForPartialUpdate, generateSqlWhereClause };
