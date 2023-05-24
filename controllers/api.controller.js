const { queryEndpoints } = require("../models/api.model");

module.exports = (request, response, next) => {
    const queries = request.query;
    return queryEndpoints(queries)
        .then((endpoints) =>
            response.status(200).send({ endpoints: endpoints })
        )
        .catch((err) => {
            next(err);
        });
};
