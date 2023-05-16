const {
    selectUserByUsername,
    updateUserByUsername,
    removeUserByUsername,
} = require("../models/api.users.username.model");

exports.getUserByUsername = (request, response, next) => {
    const { username } = request.params;
    return selectUserByUsername(username)
        .then((user) => response.status(200).send({ user: user }))
        .catch((err) => {
            next(err);
        });
};

exports.patchUserByUsername = (request, response, next) => {
    const { username } = request.params;
    const { body } = request;
    return updateUserByUsername(username, body)
        .then((user) => response.status(200).send({ user: user }))
        .catch((err) => {
            next(err);
        });
};

exports.deleteUserByUsername = (request, response, next) => {
    const { username } = request.params;
    return removeUserByUsername(username)
        .then(() => response.status(204).send())
        .catch((err) => {
            next(err);
        });
};
