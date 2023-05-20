const db = require("../db/connection.js");
const format = require("pg-format");
const sort_byWL = require("../Queries/api.categories/sort_byWL.js");

exports.selectCategories = ({ sort_by, order }) => {
    const queryArray = [];
    if (!sort_byWL.includes(sort_by)) sort_by = "slug";
    if (!["asc", "desc"].includes(order)) order = "asc";
    order = order.toUpperCase();
    const queryString = `
    SELECT slug, description
    FROM categories
    ${sort_by ? `ORDER BY ${sort_by} ${order}` : ""}
    ;`;
    return db.query(queryString).then(({ rows }) => {
        console.log(rows);
        return rows;
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
