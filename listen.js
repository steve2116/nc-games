const app = require("./app.js");

const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
    if (err) throw new Error("Error starting server");
    else console.log(`Listening on port ${PORT}...`);
});
