"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1",
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            id: expect.any(Number),
            ...newJob,
        });


        const result = await db.query(
            `SELECT title, salary, equity, company_handle
                FROM jobs
                WHERE title = 'new'`);
        expect(result.rows).toEqual([
            {
                title: "new",
                salary: 100000,
                equity: "0.1",
                company_handle: "c1",
            },
        ]);
    });

    test("bad request with dupe", async function () {
        try {
            await Job.create(newJob);
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 20000,
                equity: "0.2",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 30000,
                equity: "0",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j4",
                salary: null,
                equity: null,
                companyHandle: "c1",
            }
        ]);
    });

    test("works: with title", async function () {
        let jobs = await Job.findAll({ title: "j1" });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
        ]);
    });

    test("works: with minSalary", async function () {
        let jobs = await Job.findAll({ minSalary: 20000 });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j2",
                salary: 20000,
                equity: "0.2",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 30000,
                equity: "0",
                companyHandle: "c1",
            },
        ]);
    });

    test("works: with hasEquity", async function () {
        let jobs = await Job.findAll({ hasEquity: true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 20000,
                equity: "0.2",
                companyHandle: "c1",
            },
        ]);
    });

    test("works: with all filters", async function () {
        let jobs = await Job.findAll({ title: "j1", minSalary: 10000, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
        ]);
    });

    test("works: with some filters", async function () {
        let jobs = await Job.findAll({ title: "j1", hasEquity: true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 10000,
                equity: "0.1",
                companyHandle: "c1",
            },
        ]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "j1",
            salary: 10000,
            equity: "0.1",
            companyHandle: "c1",
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "New",
        salary: 100000,
        equity: "0.1",
    };

    test("works", async function () {
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData,
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = ${testJobIds[0]}`);
        expect(result.rows).toEqual([{
            id: testJobIds[0],
            title: "New",
            salary: 100000,
            equity: "0.1",
            company_handle: "c1",
        }]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "New",
            salary: null,
            equity: null,
        };

        let job = await Job.update(testJobIds[0], updateDataSetNulls);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateDataSetNulls,
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = ${testJobIds[0]}`);
        expect(result.rows).toEqual([{
            id: testJobIds[0],
            title: "New",
            salary: null,
            equity: null,
            company_handle: "c1",
        }]);
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(testJobIds[0], {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=1");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


