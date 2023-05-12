const db = require("../db/connection.js");
const format = require("pg-format");

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
        });
};

exports.insertCategory = ({ slug, description }) => {
    if (!slug || !description)
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    const queryString = format(
        `
        INSERT INTO categories
            (slug, description)
        VALUES
            %L
        RETURNING *
    ;`,
        [[slug, description]]
    );
    return db.query(queryString).then(({ rows }) => rows[0]);
};
