const db = require("../db/connection.js");

exports.selectCategoryBySlug = (slug) => {
    return db
        .query(
            `
        SELECT * FROM categories
        WHERE slug=$1
    ;`,
            [slug]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Category not found" });
            else return rows[0];
        });
};
