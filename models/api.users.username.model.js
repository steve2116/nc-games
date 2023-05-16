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

exports.updateUserByUsername = (username, { name, avatar_url }) => {
    if (!name && !avatar_url)
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    const queryArray = [username];
    if (name) queryArray.push(name);
    if (avatar_url) queryArray.push(avatar_url);
    return db
        .query(
            `
        UPDATE users
        SET ${name ? "name=$2" : ""}${
                name && avatar_url
                    ? ", avatar_url=$3"
                    : avatar_url
                    ? "avatar_url=$2"
                    : ""
            }
        WHERE username=$1
        RETURNING *
    ;`,
            queryArray
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "User not found" });
            else return rows[0];
        });
};
