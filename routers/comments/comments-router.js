const {
    deleteCommentById,
    patchCommentById,
    getCommentById,
} = require("../../controllers/api.comments.id.controller.js");
const jsonBody = require("../../middleware/json-body.js");

const commentsRouter = require("express").Router();

commentsRouter
    .get("/:comment_id", getCommentById)
    .patch("/:comment_id", jsonBody, patchCommentById)
    .delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
