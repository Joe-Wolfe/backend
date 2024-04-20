const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works", function () {
        const data = { firstName: 'Aliya', age: 32 };
        const jsToSql = { firstName: "first_name" };
        const result = sqlForPartialUpdate(data, jsToSql);
        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: ['Aliya', 32]
        });
    });

    test("works with empty data", function () {
        try {
            sqlForPartialUpdate({}, {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("works with one column", function () {
        const data = { firstName: 'Aliya' };
        const jsToSql = { firstName: "first_name" };
        const result = sqlForPartialUpdate(data, jsToSql);
        expect(result).toEqual({
            setCols: '"first_name"=$1',
            values: ['Aliya']
        });
    });
}); 
