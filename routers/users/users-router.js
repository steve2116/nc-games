const { getUsers } = require("../../controllers/api.users.controller.js");
const {
    getUserByUsername,
} = require("../../controllers/api.users.username.controller.js");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
