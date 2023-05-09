const { categoryData, reviewData } = require("../db/data/test-data/index.js");

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
                    data: "Each category element as an object",
                    keys: ["slug", "description"],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        categories: categoryData,
                    },
                },
            },
            "/api/review/:review_id": {
                get: {
                    status: "OK",
                    info: "A review object with a specified id",
                    data: "The review requested through a parametric endpoint",
                    keys: [
                        "review_id",
                        "title",
                        "review_body",
                        "designer",
                        "review_img_url",
                        "votes",
                        "category",
                        "owner",
                        "created_at",
                    ],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        review: reviewData[1],
                    },
                },
            },
        },
    });
};
