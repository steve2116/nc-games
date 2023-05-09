const { selectReviewById } = require("../models/api.reviews.id.model");

exports.getReviewById = (request, response, next) => {
    const { review_id } = request.params;
    return selectReviewById(review_id)
        .then((review) => {
            response.status(200).send({ review: review });
        })
        .catch((err) => {
            if (err.code && err.msg) {
                next(err);
            } else if (isNaN(review_id))
                next({
                    code: 400,
                    msg: "Error fetching data",
                });
            else
                next({
                    code: 500,
                    msg: "Error fetching data",
                });
        });
};
