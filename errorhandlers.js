exports.customErrors = (err, request, response, next) => {
    if (err.code && err.msg) {
        return response.status(err.code).send({ msg: err.msg });
    } else next(err);
};

exports.psqlErrors = (err, request, response, next) => {
    if (err.code === "22P02")
        return response.status(400).send({ msg: "Invalid review id" });
    else if (err.code === "42P01")
        return response.status(500).send({ msg: "Error fetching data" });
    else next(err);
};

exports.noneCaught = (err, request, response, next) => {
    return response.status(500).send({ msg: "Internal server error" });
};
