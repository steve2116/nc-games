const {
    selectCommentsByReviewId,
    insertCommentByReviewId,
} = require("../models/api.reviews.id.comments.model");

exports.getCommentsByReviewId = (request, response, next) => {
    const { review_id } = request.params;
    const queries = request.query;
    return selectCommentsByReviewId(review_id, queries)
        .then((comments) => response.status(200).send({ comments: comments }))
        .catch((err) => {
            next(err);
        });
};

exports.postCommentByReviewId = (request, response, next) => {
    const { review_id } = request.params;
    const comment = request.body;
    return insertCommentByReviewId(review_id, comment)
        .then((comment) => response.status(201).send({ comment: comment }))
        .catch((err) => {
            next(err);
        });
};
