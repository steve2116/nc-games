const {
    getReviewById,
    patchReviewById,
} = require("../../controllers/api.reviews.id.controller.js");
const {
    getCommentsByReviewId,
    postCommentByReviewId,
} = require("../../controllers/api.reviews.id.comments.controller.js");
const {
    getReviews,
    postReview,
} = require("../../controllers/api.reviews.controller.js");
const checkJson = require("../../middleware/json-body.js");
const jsonBody = require("../../middleware/json-body.js");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews).post("/", jsonBody, postReview);

reviewsRouter
    .get("/:review_id", getReviewById)
    .patch("/:review_id", checkJson, patchReviewById);

reviewsRouter
    .get("/:review_id/comments", getCommentsByReviewId)
    .post("/:review_id/comments", checkJson, postCommentByReviewId);

module.exports = reviewsRouter;
