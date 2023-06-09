const { selectReviews, insertReview } = require("../models/api.reviews.model");

exports.getReviews = (request, response, next) => {
    const queries = request.query;
    return selectReviews(queries)
        .then(({ reviews, count }) => {
            return response
                .status(200)
                .send({ reviews: reviews, total_count: count });
        })
        .catch((err) => {
            next(err);
        });
};

exports.postReview = (request, response, next) => {
    const { body } = request;
    return insertReview(body)
        .then((review) => response.status(201).send({ review: review }))
        .catch((err) => {
            next(err);
        });
};
