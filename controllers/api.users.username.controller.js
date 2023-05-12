const { selectUserByUsername } = require("../models/api.users.username.model");

exports.getUserByUsername = (request, response, next) => {
    const { username } = request.params;
    return selectUserByUsername(username)
        .then((user) => response.status(200).send({ user: user }))
        .catch((err) => {
            next(err);
        });
};
