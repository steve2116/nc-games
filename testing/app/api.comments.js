const request = require("supertest");
const db = require("../../db/connection.js");
const app = require("../../app.js");

module.exports = describe("/api/comments/:comment_id", () => {
    describe("GET", () => {
        test("Should respond with a comment", async () => {
            await request(app)
                .get("/api/comments/2")
                .expect(200)
                .then((response) => {
                    const { body } = response;
                    expect(body).toHaveProperty("comment");
                });
        });
        test("Should respond with the specified comment formatted correctly", async () => {
            await request(app)
                .get("/api/comments/2")
                .then((response) => {
                    const { comment } = response.body;
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: 13,
                        created_at: expect.any(String),
                        author: "mallionaire",
                        body: "My dog loved this game too!",
                        review_id: 3,
                    });
                });
        });
        test("Should respond with the correct error message when passed an invalid comment id", async () => {
            await request(app)
                .get("/api/comments/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a comment id that doesn't exist", async () => {
            await request(app)
                .get("/api/comments/99")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Comment not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .get("/api/comments/2; DROP TABLE reviews")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
    });
    describe("PATCH", () => {
        test("Should respond with the specified comment", async () => {
            const patchComment = { inc_votes: 0 };
            await request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(200)
                .then((response) => {
                    const { comment_id } = response.body.comment;
                    expect(comment_id).toBe(2);
                });
        });
        test("Should respond with the changed comment", async () => {
            const patchComment = { inc_votes: 4 };
            await request(app)
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
        test("Should respond with the correct error message when passed an invalid comment id", async () => {
            const patchComment = { inc_votes: 2 };
            await request(app)
                .patch("/api/comments/nonsense")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a comment id that doesn't exist", async () => {
            const patchComment = { inc_votes: 3 };
            await request(app)
                .patch("/api/comments/99999")
                .send(patchComment)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Comment not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            const patchComment = { inc_votes: 1 };
            await request(app)
                .patch("/api/comments/2; DROP TABLE comments;")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed a number", async () => {
            const patchComment = { inc_votes: "still a number definitely" };
            await request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when not passed the correct key", async () => {
            const patchComment = { inc_voes: 2 };
            await request(app)
                .patch("/api/comments/2")
                .send(patchComment)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should ignore any extra key-value pairs passed", async () => {
            const patchComment = { inc_votes: -5, dec_votes: 5, inc_voes: 2 };
            await request(app)
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
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const patchComment = "inc_votes,dec_votes\n2,1";
            await request(app)
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
        test("Should respond with no body and a 204 status code", async () => {
            await request(app)
                .delete("/api/comments/1")
                .expect(204)
                .then((response) => {
                    const { body } = response;
                    expect(Object.keys(body).length).toBe(0);
                });
        });
        test("Should delete the comment", async () => {
            await request(app)
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
        test("Should respond with the correct error message when passed an invalid comment id", async () => {
            await request(app)
                .delete("/api/comments/nonsense")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
        test("Should respond with the correct error message when passed a comment id that doesn't exist", async () => {
            await request(app)
                .delete("/api/comments/99999")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Comment not found");
                });
        });
        test("Should not allow SQL injections", async () => {
            await request(app)
                .delete("/api/comments/1;DROP TABLE comments;")
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid request");
                });
        });
    });
});
