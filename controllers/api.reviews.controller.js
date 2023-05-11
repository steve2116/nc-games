const { selectReviews } = require("../models/api.reviews.model");

exports.getReviews = (request, response, next) => {
    const queries = request.query;
    return selectReviews(queries)
        .then((reviews) => {
            return response.status(200).send({ reviews: reviews });
        })
        .catch((err) => {
            next(err);
        });
};
