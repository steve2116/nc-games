const {
    getUsers,
    postUser,
} = require("../../controllers/api.users.controller.js");
const {
    getUserByUsername,
} = require("../../controllers/api.users.username.controller.js");
const jsonBody = require("../../middleware/json-body.js");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers).post("/", jsonBody, postUser);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
