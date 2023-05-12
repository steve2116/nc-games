const db = require("../db/connection.js");

exports.selectUserByUsername = (username) => {
    return db
        .query(
            `
        SELECT * FROM users
        WHERE username=$1
    ;`,
            [username]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "User not found" });
            else return rows[0];
        });
};
