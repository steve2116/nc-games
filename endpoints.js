const {
    categoryData,
    reviewData,
    commentData,
} = require("./db/data/test-data/index.js");

const reviewDatawId = reviewData.map((review, ind) => {
    return { ...review, review_id: ind + 1 };
});

const reviewsEx = reviewDatawId.map((review) => {
    const newReview = { ...review };
    newReview.comment_count = Math.floor(Math.random() * 3);
    delete newReview.review_body;
    return newReview;
});

const commentDatawId = commentData.map((comment, ind) => {
    return { ...comment, comment_id: ind + 1 };
});

module.exports = {
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
                    "/api/reviews/:review_id/comments",
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
                example: { reviews: reviewsEx.splice(0, 3) },
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
                    review: reviewDatawId[1],
                },
            },
        },
        "/api/reviews/:review_id/comments": {
            get: {
                status: "OK",
                info: "A list of comments of specified review id",
                data: "Each comment as an object with properties and review_id of the requested review",
                keys: [
                    "comment_id",
                    "votes",
                    "created_at",
                    "author",
                    "body",
                    "review_id",
                ],
                queries: [],
                "req-body": "none",
                "res-body": "json",
                example: {
                    comments: commentDatawId.splice(0, 3),
                },
            },
        },
    },
};
