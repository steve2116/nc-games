const app = require("./app.js");

app.listen(9090, (err) => {
    if (err) throw new Error("Error starting server");
});
