/*
    While the files needed are being checked and before merge - so can keep coding
*/

// app.js

app.get("/api");

// api.controller.js

module.exports = (request, response) => {
    return response.status(200).send({
        endpoints: {
            "/api": {
                get: {
                    info: "An object of all endpoints",
                    data: "Each endpoint object contains the methods avaliable with information on each.",
                    keys: ["/api", "/api/categories"],
                    queries: null,
                    body: "No body",
                    example: null,
                },
            },
            "/api/categories": {
                get: {
                    info: "An array of categories",
                    data: "Each category element be an object with two properties: slug; description.",
                    keys: ["slug", "description"],
                    queries: null,
                    body: "no body",
                    example: "",
                },
            },
        },
    });
};

// no exports here

module.exports = null;
