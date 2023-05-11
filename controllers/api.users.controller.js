const { selectUsers } = require("../models/api.users.model");

exports.getUsers = (request, response, next) => {
    return selectUsers()
        .then((users) => response.status(200).send({ users: users }))
        .catch((err) => {
            next(err);
        });
};
