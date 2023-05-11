module.exports = (request, response, next) => {
    if (request.rawHeaders[5] !== "application/json")
        next({ code: 400, msg: "Invalid body format" });
    else next();
};
