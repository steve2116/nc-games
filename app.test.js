const request = require("supertest");
const testData = require("./db/data/test-data/index.js");
const seed = require("./db/seeds/seed.js");
const db = require("./db/connection.js");
const app = require("./app.js");

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    db.end();
});

describe("/api/categories", () => {
    describe("GET", () => {
        test("Should respond with an array of categories", () => {
            return request(app)
                .get("/api/categories")
                .expect(200)
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
        test("Should respond with the correct error if the server cannot retrieve data from the database", () => {
            return db
                .query(
                    `
                DROP TABLE comments;
                DROP TABLE reviews;
                DROP TABLE users;
                DROP TABLE categories;
                `
                )
                .then(() => {
                    return request(app).get("/api/categories").expect(400);
                })
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Error fetching data");
                });
        });
    });
});
