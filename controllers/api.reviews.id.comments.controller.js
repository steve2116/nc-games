const {
    selectCommentsByReviewId,
} = require("../models/api.reviews.id.comments.model");

exports.getCommentsByReviewId = (request, response, next) => {
    const { review_id } = request.params;
    return selectCommentsByReviewId(review_id)
        .then((comments) => {
            return response.status(200).send({ comments: comments });
        })
        .catch((err) => {
            next(err);
        });
};
