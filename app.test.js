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

describe("/api", () => {
    describe("GET", () => {
        test("Should return a valid JSON body", () => {
            return request(app)
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
                                queries: null,
                                "req-body": "none",
                                "res-body": "none",
                                example: null,
                            },
                        },
                        "/api/categories": {
                            get: {
                                status: expect.any(String),
                                info: expect.any(String),
                                data: expect.any(String),
                                keys: expect.any(Array),
                                queries: null,
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
    });
});

describe("/api/categories", () => {
    describe("GET", () => {
        test("Should response with an array with the correct amount of categories", () => {
            return request(app)
                .get("/api/categories")
                .expect(200)
                .then((response) => {
                    expect(response.body.categories.length).toBe(4);
                });
        });
        test("Should respond with an array of correctly formatted categories", () => {
            return request(app)
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
                    return request(app).get("/api/categories").expect(500);
                })
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Error fetching data");
                });
        });
    });
});

describe("/api/reviews", () => {
    xdescribe("GET", () => {
        test("Should respond with an array with the correct amount of reviews", () => {
            return request(app)
                .get("/api/reviews")
                .expect(200)
                .then((response) => {
                    const { reviews } = response.body;
                    expect(reviews.length).toBe(13);
                });
        });
        test("Should respond with an array of correctly formatted reviews", () => {
            return request(app)
                .get("/api/reviews")
                .then((response) => {
                    const { reviews } = response.body;
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            owner: expect.any(String),
                            title: expect.any(String),
                            review_id: expect.any(Number),
                            category: expect.any(String),
                            review_img_url: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            designer: expect.any(String),
                            comment_count: expect.any(Number),
                        });
                        expect(review).not.hasOwnProperty("review_body");
                    });
                });
        });
        test("Should respond with an array of reviews sorted in  order", () => {});
    });
});
