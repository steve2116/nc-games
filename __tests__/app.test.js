const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const app = require("../app.js");

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
    });
});

describe("/api/categories", () => {
    describe("GET", () => {
        test("Should respond with an array with the correct amount of categories", () => {
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
                    expect(msg).toBe("Internal server error");
                });
        });
    });
});

describe("/api/reviews", () => {
    describe("GET", () => {
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
                        });
                        expect(isNaN(review.comment_count)).toBe(false);
                        expect(review).not.hasOwnProperty("review_body");
                    });
                });
        });
        test("Should respond with an array of reviews sorted in descending date order", () => {
            return request(app)
                .get("/api/reviews")
                .then((response) => {
                    const { reviews } = response.body;
                    expect(reviews).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("Should respond with the correct error message if the data cannot be fetched from the database", () => {
            return db
                .query(
                    `
                DROP TABLE comments;
                DROP TABLE reviews;
                `
                )
                .then(() => {
                    return request(app).get("/api/reviews").expect(500);
                })
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Internal server error");
                });
        });
    });
});

describe("/api/reviews/:review_id", () => {
    describe("GET", () => {
        test("Should respond with a single review object", () => {
            return request(app)
                .get("/api/reviews/2")
                .expect(200)
                .then((response) => {
                    expect(typeof response.body.review).toBe("object");
                    expect(Array.isArray(response.body.review)).toBe(false);
                });
        });
        test("Should respond with a correctly formatted review object", () => {
            return request(app)
                .get("/api/reviews/2")
                .then((response) => {
                    const { review } = response.body;
                    expect(review).toMatchObject({
                        review_id: 2,
                        title: expect.any(String),
                        review_body: expect.any(String),
                        designer: expect.any(String),
                        review_img_url: expect.any(String),
                        votes: expect.any(Number),
                        category: expect.any(String),
                        owner: expect.any(String),
                        created_at: expect.any(String),
                    });
                });
        });
        test("Should respond with the correct error message for the server unable to fetch data", () => {
            return db
                .query(
                    `
                DROP TABLE comments;
                DROP TABLE reviews;
                `
                )
                .then(() => {
                    return request(app).get("/api/reviews/2").expect(500);
                })
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Internal server error");
                });
        });
        test("Should respond with the correct error message for being passed an invalid review_id", () => {
            return request(app)
                .get("/api/reviews/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message for being passed a review_id not representative of a review", () => {
            return request(app)
                .get("/api/reviews/99999999")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injections", () => {
            return request(app)
                .get("/api/reviews/4;DROP TABLE reviews;")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
    });
});

describe("/api/reviews/:review_id/comments", () => {
    describe("GET", () => {
        test("Should respond with an array with the correct amount of comments", () => {
            return request(app)
                .get("/api/reviews/2/comments")
                .expect(200)
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments.length).toBe(3);
                });
        });
        test("Should respond with an array of correctly formatted comments", () => {
            return request(app)
                .get("/api/reviews/2/comments")
                .then((response) => {
                    const { comments } = response.body;
                    comments.forEach((comment) => {
                        expect(comment).toMatchObject({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            review_id: expect.any(Number),
                        });
                    });
                });
        });
        test("Should respond with the array of comments sorted with the most recent comments first", () => {
            return request(app)
                .get("/api/reviews/3/comments")
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("Should respond with an empty array when the requested review id has no comments", () => {
            return request(app)
                .get("/api/reviews/1/comments")
                .expect(200)
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments.length).toBe(0);
                });
        });
        test("Should respond with the correct error message when passed an invalid review_id", () => {
            return request(app)
                .get("/api/reviews/nonsense/comments")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review_id that doesn't exist", () => {
            return request(app)
                .get("/api/reviews/99999/comments")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injection", () => {
            return request(app)
                .get("/api/reviews/2;DROP TABLE comments;/comments")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
    });
    describe.only("POST", () => {
        test("Should respond with the comment that has been added", () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            return request(app)
                .post("/api/reviews/9/comments")
                .send(postComment)
                .expect(201)
                .then((response) => {
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        author: "mallionaire",
                        body: "Good title",
                        comment_id: expect.any(Number),
                        votes: 0,
                        created_at: expect.any(String),
                        review_id: 9,
                    });
                });
        });
        test("Should respond with the comment that has been added if only some information is passed", () => {
            const postComment = {
                username: "mallionaire",
            };
            return request(app)
                .post("/api/reviews/9/comments")
                .send(postComment)
                .expect(201)
                .then((response) => {
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        author: "mallionaire",
                        body: expect.any(String),
                        comment_id: expect.any(Number),
                        votes: 0,
                        created_at: expect.any(String),
                        review_id: 9,
                    });
                });
        });
        test("Should respond with the comment that has been added if too much information has been passed", () => {
            const postComment = {
                body: "Good title",
                votes: 2,
                username: "mallionaire",
                review_id: 2,
                created_at: new Date(),
                "what author likes": "cheese",
            };
            return request(app)
                .post("/api/reviews/9/comments")
                .send(postComment)
                .expect(201)
                .then((response) => {
                    delete postComment["what author likes"];
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        author: "mallionaire",
                        body: "Good title",
                        comment_id: expect.any(Number),
                        votes: 0,
                        created_at: expect.any(String),
                        review_id: 9,
                    });
                    expect(comment).not.hasOwnProperty("what author likes");
                    expect(comment).not.hasOwnProperty("username");
                    expect(comment).not.hasOwnProperty(
                        "created_at",
                        postComment.created_at
                    );
                });
        });
        test("Should respond with the correct error message when passed an invalid review id", () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            return request(app)
                .post("/api/reviews/nonsense/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review id that doesn't exist", () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            return request(app)
                .post("/api/reviews/99999/comments")
                .send(postComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should not allow SQL injection", () => {
            const postComment = {
                username: "Mallionaire",
                body: "Great title",
            };
            return request(app)
                .post("/api/reviews/9;DROP TABLE comments;/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a username that doesn't exixt", () => {
            const postComment = {
                username: "steve2116",
                body: "Good title",
            };
            return request(app)
                .post("/api/reviews/1/comments")
                .send(postComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a username", () => {
            const postComment = {
                body: "Great title",
            };
            return request(app)
                .post("/api/reviews/9/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", () => {
            const postComment =
                "city,state,population,land area\nseattle,WA,938723,63.2\nkansas city,NY,237833,230.3";
            return request(app)
                .post("/api/reviews/9/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
    });
});
