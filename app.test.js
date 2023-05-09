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
    test("Should respond with an array of categories", () => {
        return request(app)
            .get("/api/categories")
            .expect(200)
            .then((data) => {
                const { categories } = data.body;
                categories.forEach((category) => {
                    expect(category).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String),
                    });
                });
            });
    });
});
