module.exports = (request, response, next) => {
    if (Object.keys(request.body).length === 0)
        next({ code: 400, msg: "Invalid body format" });
    else next();
};
