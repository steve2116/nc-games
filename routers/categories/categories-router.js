const {
    getCategories,
    postCategory,
} = require("../../controllers/api.categories.controller");
const jsonBody = require("../../middleware/json-body");

const categoryRouter = require("express").Router();

categoryRouter.get("/", getCategories).post("/", jsonBody, postCategory);

module.exports = categoryRouter;
