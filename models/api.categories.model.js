const db = require("../db/connection.js");

exports.selectCategories = () => {
    return db
        .query(
            `
        SELECT slug, description
        FROM categories;
        `
        )
        .then((data) => {
            return data.rows;
        })
        .catch(() => {
            return Promise.reject({ code: 500, msg: "Error fetching data" });
        });
};
