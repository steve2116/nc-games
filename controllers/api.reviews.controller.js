const { selectReviews } = require("../models/api.reviews.model");

exports.getReviews = (request, response, next) => {
    return selectReviews()
        .then((reviews) => {
            return response.status(200).send({ reviews: reviews });
        })
        .catch((err) => {
            next(err);
        });
};
