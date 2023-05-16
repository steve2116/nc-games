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

exports.removeUserByUsername = (username) => {
    return db
        .query(
            `
            SELECT username FROM users
            WHERE username=$1
        `,
            [username]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "User not found" });
            else
                return db.query(
                    `
            SELECT review_id FROM reviews
            WHERE owner=$1
        ;`,
                    [username]
                );
        })
        .then(({ rows }) => {
            if (rows.length === 0) return Promise.resolve([rows]);
            const reviewPromises = [rows];
            rows.forEach(({ review_id }) => {
                reviewPromises.push(
                    db.query(
                        `
            DELETE FROM comments
            WHERE review_id=${review_id} OR author=$1
        ;`,
                        [username]
                    )
                );
            });
            return Promise.all(reviewPromises);
        })
        .then(([rows]) => {
            if (rows.length === 0) return Promise.resolve();
            return Promise.all(
                rows.map(({ review_id }) => {
                    return db.query(`
                        DELETE FROM reviews
                        WHERE review_id=${review_id}
                    ;`);
                })
            );
        })
        .then(() => {
            return db.query(
                `
                DELETE FROM users
                WHERE username=$1
            ;`,
                [username]
            );
        });
};
