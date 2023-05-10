const { categoryData, reviewData } = require("../db/data/test-data/index.js");

const reviewsEx = reviewData.map((review) => {
    const newReview = { ...review };
    newReview.comment_count = Math.floor(Math.random() * 3);
    delete newReview.review_body;
    return newReview;
});

module.exports = (request, response) => {
    return response.status(200).send({
        endpoints: {
            "/api": {
                get: {
                    status: "OK",
                    info: "A list of all endpoints",
                    data: "Each endpoint object contains the methods avaliable with information on each.",
                    //CHANGE KEYS AFTER EACH
                    keys: [
                        "/api",
                        "/api/categories",
                        "/api/reviews",
                        "/api/reviews/:review_id",
                    ],
                    //CHANGE KEYS AFTER EACH
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: null,
                },
            },
            "/api/categories": {
                get: {
                    status: "OK",
                    info: "A list of categories",
                    data: "Each category as an object with properties.",
                    keys: ["slug", "description"],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        categories: categoryData,
                    },
                },
            },
            "/api/reviews": {
                get: {
                    status: "OK",
                    info: "A list of reviews",
                    data: "Each review as an object with properties.",
                    keys: [
                        "owner",
                        "title",
                        "review_id",
                        "category",
                        "review_img_url",
                        "created_at",
                        "votes",
                        "designer",
                        "comment_count",
                    ],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: { reviews: reviewsEx },
                },
            },
            "/api/reviews/:review_id": {
                get: {
                    status: "OK",
                    info: "A review with a specified id",
                    data: "The review requested through a parametric endpoint, as an object with properties.",
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
