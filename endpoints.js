const {
    categoryData,
    reviewData,
    commentData,
    userData,
} = require("./db/data/test-data/index.js");

const categoryExample = categoryData[0];
const reviewExample = reviewData[0];
const commentExample = commentData[0];
const userExample = userData[0];

const reviewDatawId = { ...reviewExample, review_id: 1 };

const reviewsEx = {
    ...reviewDatawId,
    comment_count: Math.floor(Math.random() * 3),
};
delete reviewsEx.review_body;

const commentDatawId = { ...commentExample, comment_id: 1 };

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
                    categories: [categoryExample],
                },
            },
            post: {
                status: "OK",
                info: "Creates a new category, then returns it",
                data: "A category as an object with properties",
                keys: ["slug", "description"],
                queries: [],
                "req-body": "json",
                "res-body": "json",
                example: {
                    category: categoryExample,
                },
            },
        },
        "/api/reviews": {
            get: {
                status: "OK",
                info: "Returns a list of reviews and a count of total reviews",
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
                queries: ["category", "sort_by", "order", "limit", "p"],
                "req-body": "none",
                "res-body": "json",
                example: { reviews: [reviewsEx], total_count: 12 },
            },
            post: {
                status: "OK",
                info: "Creates a new review, then returns it",
                data: "A review as an object with properties",
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
                "req-body": "json",
                "res-body": "json",
                example: { reviews: reviewsEx },
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
                    "comment_count",
                ],
                queries: [],
                "req-body": "none",
                "res-body": "json",
                example: {
                    review: reviewsEx[1],
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
                    review: reviewDatawId,
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
                queries: ["limit", "p"],
                "req-body": "none",
                "res-body": "json",
                example: {
                    comments: [commentDatawId],
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
                    comments: [commentDatawId],
                },
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
                example: { users: [userExample] },
            },
        },
        "/api/comments/:comment_id": {
            patch: {
                status: "OK",
                info: "Updates the specified comment, and returns it",
                data: "The updated comment as an object with properties",
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
                example: { comment: commentDatawId },
            },
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
    },
};
