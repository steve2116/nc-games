const express = require("express");
const getEndPoints = require("./controllers/api.controller.js");
const { getCategories } = require("./controllers/api.categories.controller");
const { getReviewById } = require("./controllers/api.reviews.id.controller.js");
const { customErrors, psqlErrors, noneCaught } = require("./errorhandlers.js");
const { getReviews } = require("./controllers/api.reviews.controller.js");

const app = express();

// /api
app.get("/api", getEndPoints);

// /api/categories
app.get("/api/categories", getCategories);

// /api/reviews
app.get("/api/reviews", getReviews);

// /api/reviews/:review_id
app.get("/api/reviews/:review_id", getReviewById);

// Error handlers
app.use(customErrors);
app.use(psqlErrors);
app.use(noneCaught);

module.exports = app;
