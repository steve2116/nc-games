const express = require("express");
const getEndPoints = require("./controllers/api.controller.js");
const { getCategories } = require("./controllers/api.categories.controller");

const app = express();

app.get("/api", getEndPoints);

app.get("/api/categories", getCategories);

app.use((err, request, response, next) => {
    if (err.code && err.msg) {
        return response.status(err.code).send({ msg: err.msg });
    } else {
        return response.status(500).send({ msg: "Error, no error error" });
    }
});

module.exports = app;
