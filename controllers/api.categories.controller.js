const { selectCategories } = require("../models/api.categories.model");

exports.getCategories = (request, response, next) => {
    return selectCategories()
        .then((categories) => {
            response.status(200).send({ categories: categories });
        })
        .catch((err) => {
            next(err);
        });
};
