const {
    selectReviewById,
    updateReviewById,
} = require("../models/api.reviews.id.model");

exports.getReviewById = (request, response, next) => {
    const { review_id } = request.params;
    return selectReviewById(review_id)
        .then((review) => response.status(200).send({ review: review }))
        .catch((err) => {
            next(err);
        });
};

exports.patchReviewById = (request, response, next) => {
    const { review_id } = request.params;
    const { inc_votes } = request.body;
    return updateReviewById(review_id, inc_votes)
        .then((review) => response.status(200).send({ review: review }))
        .catch((err) => {
            next(err);
        });
};
