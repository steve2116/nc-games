const { customErrors, psqlErrors, noneCaught } = require("../errorhandlers.js");

const errorRouter = (err, request, response, next) => {
    request.app.use(customErrors);
    request.app.use(psqlErrors);
    request.app.use(noneCaught);
    next(err);
};

module.exports = errorRouter;
