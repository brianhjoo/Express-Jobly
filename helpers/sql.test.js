"use strict"

const { sqlForPartialUpdate } = require("./sql");
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