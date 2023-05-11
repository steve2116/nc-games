const { customErrors, psqlErrors, noneCaught } = require("../errorhandlers.js");

const errorRouter = (err, request, response, next) => {
    customErrors(err, request, response, next);
    psqlErrors(err, request, response, next);
    noneCaught(err, request, response, next);
};

module.exports = errorRouter;
