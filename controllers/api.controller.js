const endpoints = require("../endpoints.js");

module.exports = (request, response) => {
    return response.status(200).send(endpoints);
};
