const {
    removeCommentById,
    updateCommentById,
    selectCommentById,
} = require("../models/api.comments.id.model");

exports.getCommentById = (request, response, next) => {
    const { comment_id } = request.params;
    return selectCommentById(comment_id)
        .then((comment) => response.status(200).send({ comment: comment }))
        .catch((err) => {
            next(err);
        });
};

exports.deleteCommentById = (request, response, next) => {
    const { comment_id } = request.params;
    return removeCommentById(comment_id)
        .then(() => response.status(204).send())
        .catch((err) => {
            next(err);
        });
};

exports.patchCommentById = (request, response, next) => {
    const { comment_id } = request.params;
    const { inc_votes } = request.body;
    return updateCommentById(comment_id, inc_votes)
        .then((comment) => response.status(200).send({ comment: comment }))
        .catch((err) => {
            next(err);
        });
};
