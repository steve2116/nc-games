const { selectCategoryBySlug } = require("../models/api.categories.slug.model");

exports.getCategoryBySlug = (request, response, next) => {
    const { slug } = request.params;
    return selectCategoryBySlug(slug)
        .then((category) => response.status(200).send({ category: category }))
        .catch((err) => {
            next(err);
        });
};
