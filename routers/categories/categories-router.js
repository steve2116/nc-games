const {
    getCategories,
    postCategory,
} = require("../../controllers/api.categories.controller");
const {
    getCategoryBySlug,
} = require("../../controllers/api.categories.slug.controller");
const jsonBody = require("../../middleware/json-body");

const categoryRouter = require("express").Router();

categoryRouter.get("/", getCategories).post("/", jsonBody, postCategory);

categoryRouter.get("/:slug", getCategoryBySlug);

module.exports = categoryRouter;
