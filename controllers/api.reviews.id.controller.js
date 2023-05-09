const { selectReviewById } = require("../models/api.reviews.id.model");

exports.getReviewById = (request, response, next) => {
    const { review_id } = request.params;
    return selectReviewById(review_id)
        .then((review) => {
            response.status(200).send({ review: review });
        })
        .catch((err) => {
            next(err);
        });
};
