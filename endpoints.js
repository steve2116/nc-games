const {
    categoryData,
    reviewData,
    commentData,
    userData,
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
                info: "Returns a list of all endpoints",
                data: "Each endpoint object contains the methods avaliable with information on each.",
                keys: [
                    "/api",
                    "/api/categories",
                    "/api/reviews",
                    "/api/reviews/:review_id",
                    "/api/reviews/:review_id/comments",
                    "/api/comments/:comment_id",
                    "/api/users",
                ],

                queries: [],
                "req-body": "none",
                "res-body": "json",
                example: null,
            },
        },
        "/api/categories": {
            get: {
                status: "OK",
                info: "Returns a list of categories",
                data: "Each category as an object with properties.",
                keys: ["slug", "description"],
                queries: [],
                "req-body": "none",
                "res-body": "json",
                example: {
                    categories: [categoryData[0]],
                },
            },
        },
        "/api/reviews": {
            get: {
                status: "OK",
                info: "Returns a list of reviews",
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
                queries: ["category", "sort_by", "order"],
                "req-body": "none",
                "res-body": "json",
                example: { reviews: [reviewsEx[0]] },
            },
        },
        "/api/reviews/:review_id": {
            get: {
                status: "OK",
                info: "Returns a review with a specified id",
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
                    review: reviewDatawId[0],
                },
            },
            patch: {
                status: "OK",
                info: "Updates the specified review, and returns it",
                data: "The updated review as an object with properties",
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
                "req-body": "json",
                "res-body": "json",
                example: {
                    review: reviewDatawId[0],
                },
            },
        },
        "/api/reviews/:review_id/comments": {
            get: {
                status: "OK",
                info: "Returns a list of comments of specified review",
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
                    comments: [commentDatawId[0]],
                },
            },
            post: {
                status: "OK",
                info: "Creates a new comment for a specified review, then returns it",
                data: "A comment as an object with properties",
                keys: [
                    "comment_id",
                    "votes",
                    "created_at",
                    "author",
                    "body",
                    "review_id",
                ],
                queries: [],
                "req-body": "json",
                "res-body": "json",
                example: {
                    comments: [commentDatawId[0]],
                },
            },
        },
        "/api/comments/:comment_id": {
            delete: {
                status: "OK",
                info: "Deletes the specified comment",
                data: "none",
                keys: [],
                queries: [],
                "req-body": "none",
                "res-body": "none",
                example: null,
            },
        },
        "/api/users": {
            get: {
                status: "OK",
                info: "Returns a list of users",
                data: "Each user as an object with properties",
                keys: ["username", "name", "avatar_url"],
                queries: [],
                "req-body": "none",
                "res-body": "json",
                example: { users: [userData[0]] },
            },
        },
    },
};
