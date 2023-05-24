const request = require("supertest");
const app = require("../../app.js");

module.exports = describe("/api", () => {
    describe("GET", () => {
        test("Should return a valid JSON body", async () => {
            await request(app)
                .get("/api")
                .expect(200)
                .then((response) => {
                    const { endpoints } = response.body;
                    expect(endpoints).toMatchObject({
                        "/api": {
                            get: {
                                status: expect.any(String),
                                info: expect.any(String),
                                data: expect.any(String),
                                keys: expect.any(Array),
                                queries: expect.any(Array),
                                "req-body": "none",
                                "res-body": expect.any(String),
                                example: null,
                            },
                        },
                        "/api/categories": {
                            get: {
                                status: expect.any(String),
                                info: expect.any(String),
                                data: expect.any(String),
                                keys: expect.any(Array),
                                queries: expect.any(Array),
                                "req-body": "none",
                                "res-body": expect.any(String),
                                example: {
                                    categories: expect.any(Array),
                                },
                            },
                        },
                    });
                    endpoints["/api/categories"].get.example.categories.forEach(
                        (category) => {
                            expect(category).toMatchObject({
                                slug: expect.any(String),
                                description: expect.any(String),
                            });
                        }
                    );
                });
        });
        describe("Queries", () => {
            test('Should allow the client to query "method"', async () => {
                await request(app)
                    .get("/api?method=get")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            expect(endpoint).toMatchObject({
                                get: expect.any(Object),
                            });
                            expect(
                                Object.keys(endpoint).filter(
                                    (key) => key !== "get"
                                ).length
                            ).toBe(0);
                        });
                    });
            });
            test('Should allow the client to query "status"', async () => {
                await request(app)
                    .get("/api?status=OK")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            for (let key in endpoint) {
                                expect(endpoint[key].status).toBe("OK");
                            }
                        });
                    });
            });
            test('Should allow the client to query "hasKeys"', async () => {
                await request(app)
                    .get("/api?hasKeys=false")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            Object.values(endpoint).forEach((method) => {
                                expect(method).toMatchObject({ keys: [] });
                            });
                        });
                    });
            });
            test('Should allow the client to query "hasQueries"', async () => {
                await request(app)
                    .get("/api?hasQueries=true")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            Object.values(endpoint).forEach((method) => {
                                expect(method).toMatchObject({
                                    queries: expect.any(Array),
                                });
                                expect(method.queries).not.toEqual([]);
                            });
                        });
                    });
            });
            test('Should allow the client to query "req_body"', async () => {
                await request(app)
                    .get("/api?req_body=none")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            Object.values(endpoint).forEach((method) => {
                                expect(method).toMatchObject({
                                    "req-body": "none",
                                });
                            });
                        });
                    });
            });
            test('Should allow the client to query "res_body"', async () => {
                await request(app)
                    .get("/api?res_body=json")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            Object.values(endpoint).forEach((method) => {
                                expect(method).toMatchObject({
                                    "res-body": "json",
                                });
                            });
                        });
                    });
            });
            test("Should allow multiple queries", async () => {
                await request(app)
                    .get("/api?hasKeys=true&hasQueries=true&method=post")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            expect(endpoint).toEqual({
                                post: expect.any(Object),
                            });
                            expect(endpoints.post.keys).not.toHaveLength(0);
                            expect(endpoints.post.queries).not.toHaveLength(0);
                        });
                    });
            });
            test('Should allow the user to query "limit"', async () => {
                await request(app)
                    .get("/api?limit=3")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        expect(Object.keys(endpoints).length).toBe(3);
                    });
            });
            test('Should allow the user to query "page number"', async () => {
                await request(app)
                    .get("/api?p=2&limit=2")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        expect(Object.keys(endpoints).length).toBe(2);
                        expect(endpoints).toHaveProperty(
                            "/api/categories/:slug"
                        );
                        expect(endpoints).toHaveProperty("/api/reviews");
                    });
            });
            test("Should ignore queries that don't exist", async () => {
                await request(app)
                    .get(
                        "/api?category=social deduction&sort_by=title&order=asc&lim=1&page=2&method=delete"
                    )
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        expect(Object.keys(endpoints)).not.toHaveLength(1);
                        Object.values(endpoints).forEach((endpoint) => {
                            expect(endpoint).toEqual({
                                delete: expect.any(Object),
                            });
                        });
                    });
            });
            test("Should ignore queries that aren't valid", async () => {
                await request(app)
                    .get(
                        "/api?limit=3&method=asdasd84=[Function: HelloWorld=(Hello?) => undefined]"
                    )
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        expect(Object.keys(endpoints)).toHaveLength(3);
                        Object.values(endpoints).forEach((endpoint) => {
                            const meths = Object.keys(endpoint);
                            expect(
                                meths.includes("get") ||
                                    meths.includes("post") ||
                                    meths.includes("patch") ||
                                    meths.includes("delete")
                            ).toBe(true);
                        });
                    });
            });
            test("Should ignore SQL injection", async () => {
                await request(app)
                    .get("/api?method=get;DROP TABLE reviews;")
                    .expect(200)
                    .then((response) => {
                        const { endpoints } = response.body;
                        Object.values(endpoints).forEach((endpoint) => {
                            const meths = Object.keys(endpoint);
                            expect(
                                meths.includes("get") ||
                                    meths.includes("post") ||
                                    meths.includes("patch") ||
                                    meths.includes("delete")
                            ).toBe(true);
                        });
                    });
            });
        });
    });
});
