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
});