const getEndPoints = require("../controllers/api.controller.js");
const { getCategories } = require("../controllers/api.categories.controller");
const { getUsers } = require("../controllers/api.users.controller.js");
const {
    deleteCommentById,
} = require("../controllers/api.comments.id.controller.js");

const reviewsRouter = require("./reviews/reviews-router.js");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndPoints);

apiRouter.get("/categories", getCategories);

apiRouter.use("/reviews", reviewsRouter);

apiRouter.delete("/comments/:comment_id", deleteCommentById);

apiRouter.get("/users", getUsers);

module.exports = apiRouter;
