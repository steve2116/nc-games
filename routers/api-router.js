const getEndPoints = require("../controllers/api.controller.js");
const { getCategories } = require("../controllers/api.categories.controller");
const {
    deleteCommentById,
} = require("../controllers/api.comments.id.controller.js");

const reviewsRouter = require("./reviews/reviews-router.js");
const usersRouter = require("./users/users-router.js");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndPoints);

apiRouter.use("/reviews", reviewsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.get("/categories", getCategories);

apiRouter.delete("/comments/:comment_id", deleteCommentById);

module.exports = apiRouter;
