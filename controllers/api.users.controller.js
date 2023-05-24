const { selectUsers, createUser } = require("../models/api.users.model");

exports.getUsers = (request, response, next) => {
    const queries = request.query;
    return selectUsers(queries)
        .then((users) => response.status(200).send({ users: users }))
        .catch((err) => {
            next(err);
        });
};

exports.postUser = (request, response, next) => {
    const newUser = request.body;
    return createUser(newUser)
        .then((user) => response.status(201).send({ user: user }))
        .catch((err) => {
            next(err);
        });
};
