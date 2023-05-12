const {
    getCategories,
} = require("../../controllers/api.categories.controller");

const categoryRouter = require("express").Router();

categoryRouter.get("/", getCategories).post("/");

module.exports = categoryRouter;
