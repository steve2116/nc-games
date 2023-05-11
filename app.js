const express = require("express");
const apiRouter = require("./routers/api-router");
const errorRouter = require("./routers/error-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use(errorRouter);

module.exports = app;
