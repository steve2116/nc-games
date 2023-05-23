const db = require("../db/connection.js");
const format = require("pg-format");
const sort_byWL = require("../Queries/api.categories/sort_byWL.js");

exports.selectCategories = ({ sort_by, order, limit, p }) => {
    if (!sort_byWL.includes(sort_by)) sort_by = "slug";
    if (!["asc", "desc"].includes(order)) order = "asc";
    if (isNaN(limit) || limit < 1 || limit % 1 !== 0) limit = 10;
    if (isNaN(p) || p < 1 || p % 1 !== 0) p = 1;
    order = order.toUpperCase();
    const queryString = `
    SELECT slug, description
    FROM categories
    ORDER BY ${sort_by} ${order}
    LIMIT ${limit} OFFSET ${(p - 1) * limit}    
    ;`;
    return db.query(queryString).then(({ rows }) => {
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
