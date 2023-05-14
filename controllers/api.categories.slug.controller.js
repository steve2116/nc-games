const {
    selectCategoryBySlug,
    updateCategoryBySlug,
} = require("../models/api.categories.slug.model");

exports.getCategoryBySlug = (request, response, next) => {
    const { slug } = request.params;
    return selectCategoryBySlug(slug)
        .then((category) => response.status(200).send({ category: category }))
        .catch((err) => {
            next(err);
        });
};

exports.patchCategoryBySlug = (request, response, next) => {
    const { slug } = request.params;
    const { body } = request;
    return updateCategoryBySlug(slug, body)
        .then((category) => response.status(200).send({ category: category }))
        .catch((err) => {
            next(err);
        });
};
