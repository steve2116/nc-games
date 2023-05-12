const {
    selectCategories,
    insertCategory,
} = require("../models/api.categories.model");

exports.getCategories = (request, response, next) => {
    return selectCategories()
        .then((categories) => {
            response.status(200).send({ categories: categories });
        })
        .catch((err) => {
            next(err);
        });
};

exports.postCategory = (request, response, next) => {
    const { body } = request;
    return insertCategory(body)
        .then((category) => response.status(201).send({ category: category }))
        .catch((err) => {
            next(err);
        });
};
