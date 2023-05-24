const request = require("supertest");
const db = require("../../db/connection.js");
const app = require("../../app.js");

module.exports = describe("/api/categories", () => {
    describe("GET", () => {
        test("Should respond with an array with the correct amount of categories", async () => {
            await request(app)
                .get("/api/categories")
                .expect(200)
                .then((response) => {
                    expect(response.body.categories.length).toBe(4);
                });
        });
        test("Should respond with an array of correctly formatted categories", async () => {
            await request(app)
                .get("/api/categories")
                .then((response) => {
                    const { categories } = response.body;
                    categories.forEach((category) => {
                        expect(category).toMatchObject({
                            slug: expect.any(String),
                            description: expect.any(String),
                        });
                    });
                });
        });
        test("Should respond with the correct error if the server cannot retrieve data from the database", async () => {
            await db
                .query(
                    `
                DROP TABLE comments;
                DROP TABLE reviews;
                DROP TABLE users;
                DROP TABLE categories;
                `
                )
                .then(() => {
                    return request(app).get("/api/categories").expect(500);
                })
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Internal server error");
                });
        });
        describe("Queries", () => {
            test("Should allow the client to query sort_by", async () => {
                await request(app)
                    .get("/api/categories?sort_by=description")
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toBeSortedBy("description", {
                            descending: false,
                        });
                    });
            });
            test("Should allow the client to query order", async () => {
                await request(app)
                    .get("/api/categories?order=desc")
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toBeSortedBy("slug", {
                            descending: true,
                        });
                    });
            });
            test("Should allow multiple queries", async () => {
                await request(app)
                    .get("/api/categories?order=asc&sort_by=description")
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toBeSortedBy("description", {
                            descending: false,
                        });
                    });
            });
            test('Should allow the user to query "limit"', async () => {
                await request(app)
                    .get("/api/categories?limit=2")
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toHaveLength(2);
                    });
            });
            test('Should allow the user to query "page number"', async () => {
                await request(app)
                    .get("/api/categories?limit=3&p=2")
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toHaveLength(1);
                    });
            });
            test("Should ignore queries that are invalid", async () => {
                await request(app)
                    .get(
                        '/api/categories?limit=3&p=2aksjdhaksjdhaskjdhFUNCTIONTRUE;DOO"'
                    )
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toHaveLength(3);
                    });
            });
            test("Should ignore queries that don't exist", async () => {
                await request(app)
                    .get(
                        "/api/categories?peanut=yum&allergy=true&o_oh=:(&limit=3"
                    )
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toHaveLength(3);
                        expect(categories).toBeSortedBy("slug", {
                            descending: false,
                        });
                    });
            });
            test("Should ignore SQL injection", async () => {
                await request(app)
                    .get(
                        "/api/categories?limit=2&sort_by=description; DROP TABLE categories;&order=desc"
                    )
                    .expect(200)
                    .then((response) => {
                        const { categories } = response.body;
                        expect(categories).toHaveLength(2);
                        expect(categories).toBeSortedBy("slug", {
                            descending: true,
                        });
                    });
            });
        });
    });
    describe("POST", () => {
        test("Should respond with the posted category", async () => {
            const postCategory = {
                slug: "shouty",
                description: "very loud",
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(201)
                .then((response) => {
                    const { body } = response;
                    expect(body).toHaveProperty("category");
                });
        });
        test("Should respond with the category formatted correctly", async () => {
            const postCategory = {
                slug: "shouty",
                description: "very loud",
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({ ...postCategory });
                });
        });
        test("Should respond with the correct error message when not passed enough properties", async () => {
            const postCategory = {
                slug: "shouty",
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should ignore extra properties passed", async () => {
            const postCategory = {
                slug: "shouty",
                description: "very loud",
                console: "log",
                log: "console",
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(201)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({
                        slug: "shouty",
                        description: "very loud",
                    });
                    expect(category).not.toHaveProperty("console");
                    expect(category).not.toHaveProperty("log");
                });
        });
        test("Should not allow SQL injection", async () => {
            const postCategory = {
                slug: "shouty",
                description: "very loud; DROP TABLE categories;",
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(201)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({ ...postCategory });
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const postCategory = "slug,description\nshouty,very loud";
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
        test("Should respond with the correct error message when category already exists", async () => {
            const postCategory = {
                slug: "social deduction",
                description: 'new description for "social deduction"',
            };
            await request(app)
                .post("/api/categories")
                .send(postCategory)
                .expect(409)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category already exists");
                });
        });
    });
});

describe("/api/categories/:slug", () => {
    describe("GET", () => {
        test("Should respond with the specified category", async () => {
            await request(app)
                .get("/api/categories/euro game")
                .expect(200)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({
                        slug: "euro game",
                        description: "Abstact games that involve little luck",
                    });
                });
        });
        test("Should respond with the correct error message when passed a slug that doesn't exist", async () => {
            await request(app)
                .get("/api/categories/ishfhsdbcnonsense")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .get("/api/categories/dexterity; DROP TABLE categories")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
    });
    describe("PATCH", () => {
        test("Should respond with the updated category", async () => {
            const patchCategory = {
                description: "UPDATED",
            };
            await request(app)
                .patch("/api/categories/euro game")
                .send(patchCategory)
                .expect(200)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({
                        slug: "euro game",
                        description: "UPDATED",
                    });
                });
        });
        test("Should respond with the correct error message when passed a slug that doesn't exist", async () => {
            const patchCategory = {
                description: "UPDATED",
            };
            await request(app)
                .patch("/api/categories/aohercn8237rcy3q7n2")
                .send(patchCategory)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            const patchCategory = {
                description: "UPDATED; DROP TABLE categories",
            };
            await request(app)
                .patch("/api/categories/euro game; DROP TABLE comments;")
                .send(patchCategory)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
        test("Should respond with the correct error message when not passed a description", async () => {
            const patchCategory = {
                descritoton: "UPDATED??",
            };
            await request(app)
                .patch("/api/categories/euro game")
                .send(patchCategory)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should ignore extra properties passed", async () => {
            const patchCategory = {
                description: "UPDATED",
                found: "askjdhaskjd",
                slug: "iaeufhniweufn847wg 84w7gw7 ",
                AIUDHNIAWUO: '9YNC9787g87BGygN8GN8GN87GN87&!%$"&^',
            };
            await request(app)
                .patch("/api/categories/euro game")
                .send(patchCategory)
                .expect(200)
                .then((response) => {
                    const { category } = response.body;
                    expect(category).toMatchObject({
                        slug: "euro game",
                        description: "UPDATED",
                    });
                    expect(category).not.toHaveProperty("found");
                    expect(category).not.toHaveProperty("AIUDHNIAWUO");
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const patchCategory = "description\nUPDATED";
            await request(app)
                .patch("/api/categories/euro game")
                .send(patchCategory)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
    });
    describe("DELETE", () => {
        test("Should respond with no body", async () => {
            await request(app)
                .delete("/api/categories/euro game")
                .expect(204)
                .then(({ body }) => {
                    expect(Object.keys(body).length).toBe(0);
                });
        });
        test("Should delete the specified category", async () => {
            await request(app)
                .delete("/api/categories/social deduction")
                .then(() => {
                    return db.query(
                        "SELECT * FROM categories WHERE slug='social deduction'"
                    );
                })
                .then(({ rows }) => {
                    expect(rows.length).toBe(0);
                });
        });
        test("Should delete related data", async () => {
            await request(app)
                .delete("/api/categories/euro game")
                .then(() => {
                    return db.query(
                        "SELECT review_id FROM reviews WHERE category='euro game'"
                    );
                })
                .then(({ rows }) => {
                    expect(rows.length).toBe(0);
                });
        });
        test("Should respond with the correct error message when passed a category that doesn't exist", async () => {
            await request(app)
                .delete("/api/categories/ajdfakhfanonsense")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .delete("/api/categories/euro game; DROP TABLE categories;")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Category not found");
                });
        });
    });
});
