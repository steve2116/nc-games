const db = require("../db/connection.js");
const format = require("pg-format");

exports.selectUsers = () => {
    return db
        .query(
            `
        SELECT * FROM users;
    `
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
