module.exports = (request, response, next) => {
    if (!request.is("application/json"))
        next({ code: 400, msg: "Invalid body format" });
    else next();
};
