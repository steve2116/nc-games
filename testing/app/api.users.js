const request = require("supertest");
const db = require("../../db/connection.js");
const app = require("../../app.js");

module.exports = describe("/api/users", () => {
    describe("GET", () => {
        test("Should respond with an array of users", async () => {
            await request(app)
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
        describe("Queries", () => {
            test('Should allow the user to query "sort_by"', async () => {
                await request(app)
                    .get("/api/users?sort_by=username")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toBeSortedBy("username", {
                            descending: false,
                        });
                    });
            });
            test('Should allow the user to query "order"', async () => {
                await request(app)
                    .get("/api/users?order=desc")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toBeSortedBy("username", {
                            descending: true,
                        });
                    });
            });
            test("Should allow the user to use multiple queries", async () => {
                await request(app)
                    .get("/api/users?order=desc&sort_by=username")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toBeSortedBy("username", {
                            descending: true,
                        });
                    });
            });
            test('Should allow the user to query "limit"', async () => {
                await request(app)
                    .get("/api/users?limit=2")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toHaveLength(2);
                    });
            });
            test('Should allow the user to query "page"', async () => {
                await request(app)
                    .get("/api/users?limit=3&p=2")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toHaveLength(1);
                    });
            });
            test("Should ignore queries that don't exist", async () => {
                await request(app)
                    .get("/api/users?limit=3&p=1&FRENCH=FRIES&order=desc")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toHaveLength(3);
                        expect(users).toBeSortedBy("username", {
                            descending: true,
                        });
                    });
            });
            test("Should ignore queries that aren't valid", async () => {
                await request(app)
                    .get("/api/users?limit=3&p=2funcy4m3&order=desc")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toHaveLength(3);
                        expect(users).toBeSortedBy("username", {
                            descending: true,
                        });
                    });
            });
            test("Should ingore SQL injection", async () => {
                await request(app)
                    .get("/api/users?limit=3&p=1;DROP TABLE users;&order=desc")
                    .expect(200)
                    .then((response) => {
                        const { users } = response.body;
                        expect(users).toHaveLength(3);
                        expect(users).toBeSortedBy("username", {
                            descending: true,
                        });
                    });
            });
        });
    });
    describe("POST", () => {
        test("Should respond with the user that has been added", async () => {
            const postUser = {
                username: "steve2116",
                name: "Stevie",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/99140971?v=4",
            };
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(201)
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({
                        ...postUser,
                    });
                });
        });
        test("Should respond with the correct error message when not passed enough properties", async () => {
            const postUser = {
                username: "steve2116",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/99140971?v=4",
            };
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should ignore extra properties passed", async () => {
            const postUser = {
                username: "steve2116",
                name: "Stevie",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/99140971?v=4",
                cheese: "rat",
                rat: "not mouse",
                mouse: "cheese",
            };
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(201)
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({
                        username: "steve2116",
                        name: "Stevie",
                        avatar_url:
                            "https://avatars.githubusercontent.com/u/99140971?v=4",
                    });
                    expect(user).not.toHaveProperty("cheese");
                    expect(user).not.toHaveProperty("rat");
                    expect(user).not.toHaveProperty("mouse");
                });
        });
        test("Should not allow SQL injection", async () => {
            const postUser = {
                username: "steve2116; DROP TABLE reviews;",
                name: "Stevie; DROP TABLE comments",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/99140971?v=4; DROP TABLE categories;",
            };
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(201)
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({ ...postUser });
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const postUser =
                "username,name,avatar_url\nsteve2116,Stevie,https://avatars.githubusercontent.com/u/99140971?v=4";
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
        test("Should respond with the correct error message when the user already exists", async () => {
            const postUser = {
                username: "mallionaire",
                name: "anything",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/99140971?v=4",
            };
            await request(app)
                .post("/api/users")
                .send(postUser)
                .expect(409)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User already exists");
                });
        });
    });
});

describe("/api/users/:username", () => {
    describe("GET", () => {
        test("Should respond with a user", async () => {
            await request(app)
                .get("/api/users/mallionaire")
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty("user");
                });
        });
        test("Should respond with a correctly formatted user", async () => {
            await request(app)
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
        test("Should respond with the correct error when passed a username that doesn't exist", async () => {
            await request(app)
                .get("/api/users/99999999kasjhdaksjdh")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .get("/api/users/mallionaire; DROP TABLE users;")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
    });
    describe("PATCH", () => {
        test("Should respond with the updated user", async () => {
            const patchUser = {
                name: "Hazzer",
                avatar_url:
                    "https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api",
            };
            await request(app)
                .patch("/api/users/mallionaire")
                .send(patchUser)
                .expect(200)
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({
                        username: "mallionaire",
                        ...patchUser,
                    });
                });
        });
        test("Should respond with the correct error message when passed a username that doesn't exist", async () => {
            const patchUser = {
                name: "Hazzer",
                avatar_url:
                    "https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api",
            };
            await request(app)
                .patch("/api/users/nonsenseajsdnasjd")
                .send(patchUser)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            const patchUser = {
                name: "Hazzer",
                avatar_url:
                    "https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api",
            };
            await request(app)
                .patch("/api/users/mallionaire; DROP TABLE reviews;")
                .send(patchUser)
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
        test("Should respond with the correct error message when not passed the correct properties", async () => {
            const patchUser = {
                nae: "Hazzer",
                avaar_url:
                    "https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api",
            };
            await request(app)
                .patch("/api/users/mallionaire")
                .send(patchUser)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe(
                        "Insufficient information to make request"
                    );
                });
        });
        test("Should ignore extra properties", async () => {
            const patchUser = {
                name: "Hazzer; DROP TABLE categories;",
                avatar_urlasdasd:
                    "https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api",
                cheese: "cat",
            };
            await request(app)
                .patch("/api/users/mallionaire")
                .send(patchUser)
                .expect(200)
                .then((response) => {
                    const { user } = response.body;
                    expect(user).toMatchObject({
                        name: "Hazzer; DROP TABLE categories;",
                    });
                    expect(user).not.toHaveProperty("avatar_urlasdasd");
                    expect(user).not.toHaveProperty("cheese");
                });
        });
        test("Should respond with the correct error message when the body is formatted incorrectly", async () => {
            const postUser =
                "name,avatar_url\nHazzer,https://tse4.mm.bing.net/th?id=OIP.kj0ebmmsmKuUr7Ch08ftOAHaHa&pid=Api";
            await request(app)
                .patch("/api/users/mallionaire")
                .send(postUser)
                .expect(400)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("Invalid body format");
                });
        });
    });
    describe("DELETE", () => {
        test("Should respond with an empty body", async () => {
            await request(app)
                .delete("/api/users/mallionaire")
                .expect(204)
                .then(({ body }) => {
                    expect(Object.keys(body).length).toBe(0);
                });
        });
        test("Should delete the specified user", async () => {
            await request(app)
                .delete("/api/users/mallionaire")
                .then(() => {
                    return db.query(
                        "SELECT * FROM users WHERE username='mallionaire'"
                    );
                })
                .then(({ rows }) => {
                    expect(rows.length).toBe(0);
                });
        });
        test("Should respond with the correct error message when passed a user that doesn't exist", async () => {
            await request(app)
                .delete("/api/users/nonsense")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
        test("Should not allow SQL injection", async () => {
            await request(app)
                .delete("/api/users/mallionaire; DROP TABLE reviews;")
                .expect(404)
                .then((response) => {
                    const { msg } = response.body;
                    expect(msg).toBe("User not found");
                });
        });
    });
});
