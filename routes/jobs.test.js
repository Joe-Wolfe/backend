"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
    testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST / Jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
    };

    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 100000,
                equity: "0.1",
                companyHandle: "c1"
            },
        });
    });

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: 100000,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                ...newJob,
                salary: "not-a-number"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("unauth for users", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob);
        expect(resp.statusCode).toEqual(401);
    });

});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "j1",
                        salary: 1,
                        equity: "0.1",
                        companyHandle: "c1"
                    },
                    {
                        id: expect.any(Number),
                        title: "j2",
                        salary: 2,
                        equity: "0.2",
                        companyHandle: "c1"
                    },
                    {
                        id: expect.any(Number),
                        title: "j3",
                        salary: 3,
                        equity: null,
                        companyHandle: "c1"
                    },
                ],
        });
    });

    test("ok for admin", async function () {
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        title: "j1",
                        salary: 1,
                        equity: "0.1",
                        companyHandle: "c1"
                    },
                    {
                        id: expect.any(Number),
                        title: "j2",
                        salary: 2,
                        equity: "0.2",
                        companyHandle: "c1"
                    },
                    {
                        id: expect.any(Number),
                        title: "j3",
                        salary: 3,
                        equity: null,
                        companyHandle: "c1"
                    },
                ],
        });
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "j1",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            },
        });
    });

    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("ok for admin", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "j1-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "j1-new",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            },
        });
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: "not-a-number"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("unauth for users", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "j1-new",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "j1-new",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "j1-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("ok for admin", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
    });

    test("unauth for users", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});