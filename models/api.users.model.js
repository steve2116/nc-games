const db = require("../db/connection.js");
const format = require("pg-format");
const sort_byWL = require("../Queries/api.users/sort_byWL");

exports.selectUsers = ({ sort_by, order, limit, p }) => {
    if (!sort_byWL.includes(sort_by)) sort_by = "username";
    if (!["asc", "desc"].includes(order)) order = "asc";
    if (isNaN(limit) || limit < 1 || limit % 1 !== 0) limit = 10;
    if (isNaN(p) || p < 1 || p % 1 !== 0) p = 1;
    order = order.toUpperCase();
    return db
        .query(
            `
        SELECT * FROM users
        ORDER BY ${sort_by} ${order}
        LIMIT ${limit} OFFSET ${(p - 1) * limit}
    ;`
        )
        .then(({ rows }) => rows);
};

exports.createUser = ({ username, name, avatar_url }) => {
    if (!username || !name)
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    const queryString = format(
        `
        INSERT INTO users
            (username, name, avatar_url)
        VALUES
            %L
        RETURNING *
    ;`,
        [[username, name, avatar_url]]
    );
    return db.query(queryString).then(({ rows }) => rows[0]);
};
