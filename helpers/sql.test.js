"use strict"

const { sqlForPartialUpdate, generateSqlWhereClause } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("Generate sql helper object for partial update", function() {
    test("works: valid data supplied", function() {
        const result = sqlForPartialUpdate({firstName: 'Aliya', age: 32},
        {firstName: 'first_name'});

        expect(result).toEqual({ setCols: '"first_name"=$1, "age"=$2',
                                values: [ 'Aliya', 32 ]});
    });

    test("error: no data supplied", function() {
      try {
        sqlForPartialUpdate({}, {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
      } catch(err) {

        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
});

describe("Generate sql WHERE clause for company search filter", function() {
  test("works: no filters", function() {
    const result = generateSqlWhereClause({});

    expect(result).toEqual("");
  });

  test("works: nameLike only", function() {
    const result = generateSqlWhereClause({ nameLike: "FakeCo" });

    expect(result).toEqual("WHERE name ILIKE '%FakeCo%'");
  });

  test("works: nameLike and minEmployees", function() {
    const result = generateSqlWhereClause({ nameLike: "FakeCo", minEmployees: 4});

    expect(result).toEqual("WHERE name ILIKE '%FakeCo%' AND num_employees >= 4");
  });

  test("works: nameLike, minEmployees, and maxEmployees", function() {
    const result = generateSqlWhereClause({ nameLike: "FakeCo", minEmployees: 4,
                                          maxEmployees: 11 });

    expect(result).toEqual(
      `WHERE name ILIKE '%FakeCo%' AND num_employees >= 4 AND num_employees <= 11`);
  });

  test("error: throws Error if minEmployees > maxEmployees", function () {
    try {
      generateSqlWhereClause({ minEmployees: 11, maxEmployees: 4 });
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("works: minEmployees only", function() {
    const result = generateSqlWhereClause({minEmployees: 4});

    expect(result).toEqual("WHERE num_employees >= 4");
  });

  test("incorrect filter name", function() {
    const result = generateSqlWhereClause({color: "red"});

    expect(result).toEqual("");
  });
})
