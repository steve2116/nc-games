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
        describe("Queries", () => {
            test('Should allow the user to query "category"', () => {
                return request(app)
                    .get("/api/reviews?category=dexterity")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(1);
                        reviews.forEach((review) => {
                            expect(review).toMatchObject({
                                owner: expect.any(String),
                                title: expect.any(String),
                                review_id: expect.any(Number),
                                category: "dexterity",
                                review_img_url: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                designer: expect.any(String),
                            });
                        });
                    });
            });
            test('Should allow the user to query "sort_by"', () => {
                return request(app)
                    .get("/api/reviews?sort_by=votes")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews).toBeSortedBy("votes", {
                            descending: true,
                        });
                    });
            });
            test('Should allow the user to query "order"', () => {
                return request(app)
                    .get("/api/reviews?order=asc")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews).toBeSortedBy("created_at", {
                            descending: false,
                        });
                    });
            });
            test("Should allow multiple queries", () => {
                return request(app)
                    .get(
                        "/api/reviews?category=social deduction&sort_by=title&order=asc"
                    )
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(11);
                        expect(reviews).toBeSortedBy("title", {
                            descending: false,
                        });
                        reviews.forEach((review) => {
                            expect(review.category).toBe("social deduction");
                        });
                    });
            });
            test("Should ignore additional queries, or queries that don't exist", () => {
                return request(app)
                    .get(
                        "/api/reviews?category=social deduction&sort_by=title&order=asc&limit=3"
                    )
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(11);
                        expect(reviews).toBeSortedBy("title", {
                            descending: false,
                        });
                        reviews.forEach((review) => {
                            expect(review.category).toBe("social deduction");
                        });
                    });
            });
            test("Should ignore queries that aren't valid", () => {
                return request(app)
                    .get(
                        "/api/reviews?category=social deduction&sort_by=title&order=asc&19223784=[Function: HelloWorld=(Hello?) => undefined]"
                    )
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(11);
                        expect(reviews).toBeSortedBy("title", {
                            descending: false,
                        });
                        reviews.forEach((review) => {
                            expect(review.category).toBe("social deduction");
                        });
                    });
            });
            test("Should ignore SQL injection", () => {
                return request(app)
                    .get(
                        "/api/reviews?category=social deduction;DROP TABLE reviews;"
                    )
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(0);
                    });
            });
        });
    });
    describe("POST", () => {
        test("Should respond with the posted review", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
                review_img_url:
                    "'https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700'",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then(({ body }) => {
                    expect(body).hasOwnProperty("review");
                });
        });
        test("Should respond with a correctly formatted review", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
                review_img_url:
                    "'https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700'",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { review } = response.body;
                    expect(review).toMatchObject({
                        owner: "mallionaire",
                        title: "Town of Salem",
                        review_body: "Good game",
                        designer: "Dude",
                        category: "social deduction",
                        review_img_url:
                            "'https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700'",
                        review_id: expect.any(Number),
                        votes: 0,
                        created_at: expect.any(String),
                        comment_count: 0,
                    });
                });
        });
        test("Should have a default review_img_url", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.review_img_url).toEqual(expect.any(String));
                });
        });
        test("Should respond with the correct error message when passed a category that doesn't exist", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "DEFINTLY A CATEGORY",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed enough properties", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                category: "social deduction",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should ignore extra properties passed", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
                url: "a url",
                pie: "yum",
                VERYLONGSHOUTYWORD: "A VERY LONG SHOUTY SENTENCE",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { review } = response.body;
                    expect(review).not.hasOwnProperty("url");
                    expect(review).not.hasOwnProperty("pie");
                    expect(review).not.hasOwnProperty("VERYLONGSHOUTYWORD");
                });
        });
        test("Should not allow SQL injection", () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem;DROP TABLE reviews;",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { title } = response.body.review;
                    expect(title).toBe("Town of Salem;DROP TABLE reviews;");
                });
        });
        test("Should respond with the correct error message when passed an owner that doesn't exist", () => {
            const postReview = {
                owner: "DEFINTELY-AN-OWNER",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", () => {
            const postReview =
                "owner,title,review_body,designer,category\nmallionaire,Town of Salem,Good game,Dude,social deduction";
            return request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
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
        test("Should now also include comment_count in the response", () => {
            return request(app)
                .get("/api/reviews/2")
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.comment_count == 3).toBe(true);
                });
        });
    });
    describe("PATCH", () => {
        test("Should respond with the review", () => {
            const patchReview = { inc_votes: 0 };
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review).toMatchObject({
                        review_id: 9,
                        title: expect.any(String),
                        review_body: expect.any(String),
                        designer: expect.any(String),
                        review_img_url: expect.any(String),
                        votes: 10,
                        category: expect.any(String),
                        owner: expect.any(String),
                        created_at: expect.any(String),
                    });
                });
        });
        test("Should update the review", () => {
            const patchReview = { inc_votes: 2 };
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.votes).toBe(12);
                });
        });
        test("Should respond with the correct error message when passed an invalid review id", () => {
            const patchReview = { inc_votes: 1 };
            return request(app)
                .patch("/api/reviews/nonsense")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review id that doesn't exist", () => {
            const patchReview = { inc_votes: 1 };
            return request(app)
                .patch("/api/reviews/99999")
                .send(patchReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injection", () => {
            const patchReview = { inc_votes: 1 };
            return request(app)
                .patch("/api/reviews/9;DROP TABLE reviews;")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a number", () => {
            const patchReview = { inc_votes: "defintely a number" };
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed the right key name", () => {
            const patchReview = { dec_votes: -1 };
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should ignore any extra key-value pairs", () => {
            const patchReview = {
                inc_votes: 200,
                dec_votes: -1,
                "a key": "a value",
            };
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review).toMatchObject({
                        review_id: 9,
                        votes: 210,
                    });
                    expect(review).not.toMatchObject({
                        dec_votes: expect.anything(),
                        "a key": expect.anything(),
                    });
                });
        });
        test("Should respond with the correct error message when the body is incorrectly formatted", () => {
            const patchReview = "inc_votes\n2";
            return request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
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
    describe("POST", () => {
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

describe("/api/users", () => {
    describe("GET", () => {
        test("Should respond with an array of users", () => {
            return request(app)
                .get("/api/users")
                .expect(200)
                .then((response) => {
                    const { users } = response.body;
                    expect(users.length).toBe(4);
                    users.forEach((user) => {
                        expect(user).toMatchObject({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String),
                        });
                    });
                });
        });
    });
});

describe("/api/users/:username", () => {
    describe("GET", () => {
        test("Should respond with a user", () => {
            return request(app)
                .get("/api/users/mallionaire")
                .expect(200)
                .then((response) => {
                    expect(response.body).hasOwnProperty("user");
                });
        });
        test("Should respond with a correctly formatted user", () => {
            return request(app)
                .get("/api/users/mallionaire")
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({
                        username: "mallionaire",
                        name: "haz",
                        avatar_url:
                            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                    });
                });
        });
        test("Should respond with the correct error when passed a username that doesn't exist", () => {
            return request(app)
                .get("/api/users/99999999kasjhdaksjdh")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
        test("Should not allow SQL injection", () => {
            return request(app)
                .get("/api/users/mallionaire; DROP TABLE users;")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
    });
});

describe("/api/comments/:comment_id", () => {
    describe("PATCH", () => {
        test("Should return the specified comment", () => {
            const patchComment = { inc_votes: 0 };
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(200)
                .then((response) => {
                    const { comment_id } = response.body.comment;
                    expect(comment_id).toBe(2);
                });
        });
        test("Should return the changed comment", () => {
            const patchComment = { inc_votes: 4 };
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(200)
                .then((response) => {
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        body: "My dog loved this game too!",
                        votes: 17,
                        author: "mallionaire",
                        review_id: 3,
                        created_at: expect.any(String),
                    });
                });
        });
        test("Should respond with the correct error message when passed an invalid comment id", () => {
            const patchComment = { inc_votes: 2 };
            return request(app)
                .patch("/api/comments/nonsense")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a comment id that doesn't exist", () => {
            const patchComment = { inc_votes: 3 };
            return request(app)
                .patch("/api/comments/99999")
                .send(patchComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Comment not found");
                });
        });
        test("Should not allow SQL injection", () => {
            const patchComment = { inc_votes: 1 };
            return request(app)
                .patch("/api/comments/2; DROP TABLE comments;")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a number", () => {
            const patchComment = { inc_votes: "still a number definitely" };
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed the correct key", () => {
            const patchComment = { inc_voes: 2 };
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should ignore any extra key-value pairs passed", () => {
            const patchComment = { inc_votes: -5, dec_votes: 5, inc_voes: 2 };
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(200)
                .then((response) => {
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        body: "My dog loved this game too!",
                        votes: 8,
                        author: "mallionaire",
                        review_id: 3,
                        created_at: expect.any(String),
                    });
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", () => {
            const patchComment = "inc_votes,dec_votes\n2,1";
            return request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
    });
    describe("DELETE", () => {
        test("Should respond with no body and a 204 status code", () => {
            return request(app)
                .delete("/api/comments/1")
                .expect(204)
                .then((response) => {
                    const { body } = response;
                    expect(Object.keys(body).length).toBe(0);
                });
        });
        test("Should delete the comment", () => {
            return request(app)
                .delete("/api/comments/4")
                .then(() => {
                    return db.query(
                        `SELECT comment_id FROM comments WHERE comment_id=4`
                    );
                })
                .then((data) => {
                    const comments = data.rows;
                    expect(comments.length).toBe(0);
                });
        });
        test("Should respond with the correct error message when passed an invalid comment id", () => {
            return request(app)
                .delete("/api/comments/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a comment id that doesn't exist", () => {
            return request(app)
                .delete("/api/comments/99999")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Comment not found");
                });
        });
        test("Should not allow SQL injections", () => {
            return request(app)
                .delete("/api/comments/1;DROP TABLE comments;")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
    });
});
