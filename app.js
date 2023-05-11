const express = require("express");
const getEndPoints = require("./controllers/api.controller.js");
const { getCategories } = require("./controllers/api.categories.controller");
const {
    getReviewById,
    patchReviewById,
} = require("./controllers/api.reviews.id.controller.js");
const { customErrors, psqlErrors, noneCaught } = require("./errorhandlers.js");
const {
    getCommentsByReviewId,
    postCommentByReviewId,
} = require("./controllers/api.reviews.id.comments.controller.js");
const { getReviews } = require("./controllers/api.reviews.controller.js");
const checkJson = require("./middleware/json-body.js");
const {
    deleteCommentById,
} = require("./controllers/api.comments.id.controller.js");

const app = express();

app.use(express.json());

// /api
app.get("/api", getEndPoints);

// /api/categories
app.get("/api/categories", getCategories);

// /api/reviews
app.get("/api/reviews", getReviews);

// /api/reviews/:review_id
app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", checkJson, patchReviewById);

// /api/reviews/:review_id/comments
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", checkJson, postCommentByReviewId);

// /api/comments/:comment_id
app.delete("/api/comments/:comment_id", deleteCommentById);

// Error handlers
app.use(customErrors);
app.use(psqlErrors);
app.use(noneCaught);

module.exports = app;
