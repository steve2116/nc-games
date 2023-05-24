const request = require("supertest");
const db = require("../../db/connection.js");
const app = require("../../app.js");

module.exports = describe("/api/reviews", () => {
    describe("GET", () => {
        test("Should respond with an array with the correct amount of reviews", async () => {
            await request(app)
                .get("/api/reviews?limit=14")
                .expect(200)
                .then((response) => {
                    const { reviews } = response.body;
                    expect(reviews.length).toBe(13);
                });
        });
        test("Should respond with an array of correctly formatted reviews", async () => {
            await request(app)
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
                        expect(review).not.toHaveProperty("review_body");
                    });
                });
        });
        test("Should respond with an array of reviews sorted in descending date order", async () => {
            await request(app)
                .get("/api/reviews")
                .then((response) => {
                    const { reviews } = response.body;
                    expect(reviews).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("Should respond with the correct error message if the data cannot be fetched from the database", async () => {
            await db
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
            test('Should allow the user to query "category"', async () => {
                await request(app)
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
            test('Should allow the user to query "sort_by"', async () => {
                await request(app)
                    .get("/api/reviews?sort_by=votes")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews).toBeSortedBy("votes", {
                            descending: true,
                        });
                    });
            });
            test('Should allow the user to query "order"', async () => {
                await request(app)
                    .get("/api/reviews?order=asc")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews).toBeSortedBy("created_at", {
                            descending: false,
                        });
                    });
            });
            test("Should allow multiple queries", async () => {
                await request(app)
                    .get(
                        "/api/reviews?category=social deduction&sort_by=title&order=asc&limit=20"
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
            test("Should ignore queries that don't exist", async () => {
                await request(app)
                    .get(
                        "/api/reviews?&category=social deduction&sort_by=title&order=asc&limit=15"
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
            test("Should ignore queries that aren't valid", async () => {
                await request(app)
                    .get(
                        "/api/reviews?limit=15&category=social deduction&sort_by=title&order=asc&19223784=[Function: HelloWorld=(Hello?) => undefined]"
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
            test("Should ignore SQL injection", async () => {
                await request(app)
                    .get(
                        "/api/reviews?category=social deduction;DROP TABLE reviews;"
                    )
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(0);
                    });
            });
            test('Should allow the user to query "limit"', async () => {
                await request(app)
                    .get("/api/reviews?limit=3")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(3);
                    });
            });
            test('Should allow the user to query "page number"', async () => {
                await request(app)
                    .get("/api/reviews?p=2&category=social deduction")
                    .expect(200)
                    .then((response) => {
                        const { reviews } = response.body;
                        expect(reviews.length).toBe(1);
                    });
            });
        });
        test('Should have a "total_count" property, displaying total number of articles with specified queries', async () => {
            await request(app)
                .get("/api/reviews?limit=7&p=2&category=social deduction")
                .then((response) => {
                    const { reviews, total_count } = response.body;
                    expect(reviews.length).toBe(4);
                    expect(total_count).toBe(11);
                });
        });
    });
    describe("POST", () => {
        test("Should respond with the posted review", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
                review_img_url:
                    "'https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700'",
            };
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then(({ body }) => {
                    expect(body).toHaveProperty("review");
                });
        });
        test("Should respond with a correctly formatted review", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
                review_img_url:
                    "'https://images.pexels.com/photos/5350049/pexels-photo-5350049.jpeg?w=700&h=700'",
            };
            await request(app)
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
        test("Should have a default review_img_url", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.review_img_url).toEqual(expect.any(String));
                });
        });
        test("Should respond with the correct error message when passed a category that doesn't exist", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "DEFINTLY A CATEGORY",
            };
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed enough properties", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem",
                category: "social deduction",
            };
            await request(app)
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
        test("Should ignore extra properties passed", async () => {
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
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { review } = response.body;
                    expect(review).not.toHaveProperty("url");
                    expect(review).not.toHaveProperty("pie");
                    expect(review).not.toHaveProperty("VERYLONGSHOUTYWORD");
                });
        });
        test("Should not allow SQL injection", async () => {
            const postReview = {
                owner: "mallionaire",
                title: "Town of Salem;DROP TABLE reviews;",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(201)
                .then((response) => {
                    const { title } = response.body.review;
                    expect(title).toBe("Town of Salem;DROP TABLE reviews;");
                });
        });
        test("Should respond with the correct error message when passed an owner that doesn't exist", async () => {
            const postReview = {
                owner: "DEFINTELY-AN-OWNER",
                title: "Town of Salem",
                review_body: "Good game",
                designer: "Dude",
                category: "social deduction",
            };
            await request(app)
                .post("/api/reviews")
                .send(postReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const postReview =
                "owner,title,review_body,designer,category\nmallionaire,Town of Salem,Good game,Dude,social deduction";
            await request(app)
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
        test("Should respond with a single review object", async () => {
            await request(app)
                .get("/api/reviews/2")
                .expect(200)
                .then((response) => {
                    expect(typeof response.body.review).toBe("object");
                    expect(Array.isArray(response.body.review)).toBe(false);
                });
        });
        test("Should respond with a correctly formatted review object", async () => {
            await request(app)
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
        test("Should respond with the correct error message for the server unable to fetch data", async () => {
            await db
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
        test("Should respond with the correct error message for being passed an invalid review_id", async () => {
            await request(app)
                .get("/api/reviews/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message for being passed a review_id not representative of a review", async () => {
            await request(app)
                .get("/api/reviews/99999999")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injections", async () => {
            await request(app)
                .get("/api/reviews/4;DROP TABLE reviews;")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should now also include comment_count in the response", async () => {
            await request(app)
                .get("/api/reviews/2")
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.comment_count == 3).toBe(true);
                });
        });
    });
    describe("PATCH", () => {
        test("Should respond with the review", async () => {
            const patchReview = { inc_votes: 0 };
            await request(app)
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
        test("Should update the review", async () => {
            const patchReview = { inc_votes: 2 };
            await request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(200)
                .then((response) => {
                    const { review } = response.body;
                    expect(review.votes).toBe(12);
                });
        });
        test("Should respond with the correct error message when passed an invalid review id", async () => {
            const patchReview = { inc_votes: 1 };
            await request(app)
                .patch("/api/reviews/nonsense")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review id that doesn't exist", async () => {
            const patchReview = { inc_votes: 1 };
            await request(app)
                .patch("/api/reviews/99999")
                .send(patchReview)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            const patchReview = { inc_votes: 1 };
            await request(app)
                .patch("/api/reviews/9;DROP TABLE reviews;")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a number", async () => {
            const patchReview = { inc_votes: "defintely a number" };
            await request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed the right key name", async () => {
            const patchReview = { dec_votes: -1 };
            await request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should ignore any extra key-value pairs", async () => {
            const patchReview = {
                inc_votes: 200,
                dec_votes: -1,
                "a key": "a value",
            };
            await request(app)
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
        test("Should respond with the correct error message when the body is incorrectly formatted", async () => {
            const patchReview = "inc_votes\n2";
            await request(app)
                .patch("/api/reviews/9")
                .send(patchReview)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
    });
    describe("DELETE", () => {
        test("Should not respond with a body", async () => {
            await request(app)
                .delete("/api/reviews/2")
                .expect(204)
                .then((response) => {
                    const { body } = response;
                    expect(Object.keys(body).length).toBe(0);
                });
        });
        test("Should delete the review specified", async () => {
            await request(app)
                .delete("/api/reviews/2")
                .then(() => request(app).get("/api/reviews/2").expect(404));
        });
        test("Should delete all comments on that review", async () => {
            await request(app)
                .delete("/api/reviews/2")
                .then(() => request(app).get("/api/comments/4").expect(404));
        });
        test("Should respond with the correct error message when passed an invalid review id", async () => {
            await request(app)
                .delete("/api/reviews/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review id that doesn't exist", async () => {
            await request(app)
                .delete("/api/reviews/99")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .delete("/api/reviews/2; DROP TABLE comments")
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
        test("Should respond with an array with the correct amount of comments", async () => {
            await request(app)
                .get("/api/reviews/2/comments")
                .expect(200)
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments.length).toBe(3);
                });
        });
        test("Should respond with an array of correctly formatted comments", async () => {
            await request(app)
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
        test("Should respond with the array of comments sorted with the most recent comments first", async () => {
            await request(app)
                .get("/api/reviews/3/comments")
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("Should respond with an empty array when the requested review id has no comments", async () => {
            await request(app)
                .get("/api/reviews/1/comments")
                .expect(200)
                .then((response) => {
                    const { comments } = response.body;
                    expect(comments.length).toBe(0);
                });
        });
        test("Should respond with the correct error message when passed an invalid review_id", async () => {
            await request(app)
                .get("/api/reviews/nonsense/comments")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review_id that doesn't exist", async () => {
            await request(app)
                .get("/api/reviews/99999/comments")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Review not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .get("/api/reviews/2;DROP TABLE comments;/comments")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        describe("Queries", () => {
            test('Should allow the user to query "limit"', async () => {
                await request(app)
                    .get("/api/reviews/3/comments?limit=2")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(2);
                    });
            });
            test('Should allow the user to query "page number"', async () => {
                await request(app)
                    .get("/api/reviews/3/comments?p=2")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(0);
                    });
            });
            test("Should allow multiple queries", async () => {
                await request(app)
                    .get("/api/reviews/3/comments?limit=2&p=2")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(1);
                    });
            });
            test("Should ignore queries that don't exist", async () => {
                await request(app)
                    .get(
                        "/api/reviews/3/comments?&category=social deduction&sort_by=title&order=asc&limit=2"
                    )
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(2);
                    });
            });
            test("Should ignore queries that aren't valid", async () => {
                await request(app)
                    .get(
                        "/api/reviews/3/comments?limit=2&category=social deduction&pizza=asc&19223784=[Function: HelloWorld=(Hello?) => undefined]"
                    )
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(2);
                    });
            });
            test("Should ignore SQL injection", async () => {
                await request(app)
                    .get("/api/reviews/2/comments?limit=1;DROP TABLE reviews;")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments.length).toBe(3);
                    });
            });
            test('Should allow the user to query "sort_by"', async () => {
                await request(app)
                    .get("/api/reviews/2/comments?sort_by=votes")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments).toBeSortedBy("votes", {
                            descending: true,
                        });
                    });
            });
            test('Should allow the user to query "order"', async () => {
                await request(app)
                    .get("/api/reviews/3/comments?order=asc")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        expect(comments).toBeSortedBy("created_at", {
                            descending: false,
                        });
                    });
            });
            test('Should allow the user to query "author"', async () => {
                await request(app)
                    .get("/api/reviews/2/comments?author=bainesface")
                    .expect(200)
                    .then((response) => {
                        const { comments } = response.body;
                        comments.forEach((comment) => {
                            expect(comment).toHaveProperty(
                                "author",
                                "bainesface"
                            );
                        });
                    });
            });
        });
    });
    describe("POST", () => {
        test("Should respond with the comment that has been added", async () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            await request(app)
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
        test("Should respond with the comment that has been added if only some information is passed", async () => {
            const postComment = {
                username: "mallionaire",
            };
            await request(app)
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
        test("Should respond with the comment that has been added if too much information has been passed", async () => {
            const postComment = {
                body: "Good title",
                votes: 2,
                username: "mallionaire",
                review_id: 2,
                created_at: new Date(),
                "what author likes": "cheese",
            };
            await request(app)
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
                    expect(comment).not.toHaveProperty("what author likes");
                    expect(comment).not.toHaveProperty("username");
                    expect(comment).not.toHaveProperty(
                        "created_at",
                        postComment.created_at
                    );
                });
        });
        test("Should respond with the correct error message when passed an invalid review id", async () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            await request(app)
                .post("/api/reviews/nonsense/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a review id that doesn't exist", async () => {
            const postComment = {
                username: "mallionaire",
                body: "Good title",
            };
            await request(app)
                .post("/api/reviews/99999/comments")
                .send(postComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should not allow SQL injection", async () => {
            const postComment = {
                username: "Mallionaire",
                body: "Great title",
            };
            await request(app)
                .post("/api/reviews/9;DROP TABLE comments;/comments")
                .send(postComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a username that doesn't exixt", async () => {
            const postComment = {
                username: "steve2116",
                body: "Good title",
            };
            await request(app)
                .post("/api/reviews/1/comments")
                .send(postComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a username", async () => {
            const postComment = {
                body: "Great title",
            };
            await request(app)
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
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const postComment =
                "city,state,population,land area\nseattle,WA,938723,63.2\nkansas city,NY,237833,230.3";
            await request(app)
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
