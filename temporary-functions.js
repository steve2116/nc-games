/*
    While the files needed are being checked and before merge - so can keep coding
*/

// app.js

app.get("/api");

// api.controller.js

module.exports = (request, response) => {
    return response.status(200).send({
        endpoints: {
            "/api": {
                get: {
                    status: "OK",
                    info: "An object of all endpoints",
                    data: "Each endpoint object contains the methods avaliable with information on each.",
                    keys: ["/api", "/api/categories"],
                    queries: null,
                    "req-body": "none",
                    "res-body": "none",
                    example: null,
                },
            },
            "/api/categories": {
                get: {
                    status: "OK",
                    info: "An array of categories",
                    data: "Each category element be an object with two properties: slug; description.",
                    keys: ["slug", "description"],
                    queries: null,
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        categories: [
                            {
                                slug: "euro game",
                                description:
                                    "Abstact games that involve little luck",
                            },
                            {
                                slug: "social deduction",
                                description:
                                    "Players attempt to uncover each other's hidden role",
                            },
                        ],
                    },
                },
            },
        },
    });
};

// app.test.js

describe("/api", () => {
    describe("GET", () => {
        test("Should return a valid JSON body", () => {
            return request(app)
                .get("/api")
                .expect(200)
                .then((data) => {
                    const { endpoints } = data.body;
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
                            expect(category).toMatchObjet({
                                slug: expect.any(String),
                                description: expect.any(String),
                            });
                        }
                    );
                });
        });
    });
});

// no exports here

module.exports = null;
