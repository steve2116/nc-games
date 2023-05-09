module.exports = (request, response) => {
    return response.status(200).send({
        endpoints: {
            "/api": {
                get: {
                    status: "OK",
                    info: "An object of all endpoints",
                    data: "Each endpoint object contains the methods avaliable with information on each.",
                    keys: ["/api", "/api/categories"],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: null,
                },
            },
            "/api/categories": {
                get: {
                    status: "OK",
                    info: "An array of categories",
                    data: "Each category element be an object with two properties: slug; description.",
                    keys: ["slug", "description"],
                    queries: [],
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
            "/api/review/:review_id": {
                get: {
                    status: "under maintenance",
                    info: "",
                    data: "",
                    keys: [],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: null,
                },
            },
        },
    });
};
