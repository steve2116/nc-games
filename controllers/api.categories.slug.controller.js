const {
    selectCategoryBySlug,
    updateCategoryBySlug,
    removeCategoryBySlug,
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

exports.deleteCategoryBySlug = (request, response, next) => {
    const { slug } = request.params;
    return removeCategoryBySlug(slug)
        .then(() => {
            response.status(204).send();
        })
        .catch((err) => {
            next(err);
        });
};
