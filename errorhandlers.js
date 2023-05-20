exports.customErrors = (err, request, response, next) => {
    console.log(err);
    if (err.code && err.msg) {
        return response.status(err.code).send({ msg: err.msg });
    } else next(err);
};

exports.psqlErrors = (err, request, response, next) => {
    if (err.code === "22P02")
        return response.status(400).send({ msg: "Invalid request" });
    else if (err.code === "23503")
        return response.status(404).send({ msg: "Invalid request" });
    else if (err.code === "23502")
        return response.status(400).send({ msg: "Invalid request" });
    else if (err.code === "23505") {
        return response.status(409).send({
            msg: `${
                request.originalUrl === "/api/users"
                    ? "User"
                    : request.originalUrl === "/api/categories"
                    ? "Category"
                    : "ERROR something"
            } already exists`,
        });
    } else next(err);
};

exports.noneCaught = (err, request, response, next) => {
    return response.status(500).send({ msg: "Internal server error" });
};
