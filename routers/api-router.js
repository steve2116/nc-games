const getEndPoints = require("../controllers/api.controller.js");
const { getCategories } = require("../controllers/api.categories.controller");

const reviewsRouter = require("./reviews/reviews-router.js");
const usersRouter = require("./users/users-router.js");
const commentsRouter = require("./comments/comments-router.js");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndPoints);

apiRouter.get("/categories", getCategories);

apiRouter.use("/reviews", reviewsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
