const db = require("../db/connection.js");

exports.selectCommentById = (id) => {
    return db
        .query(
            `
        SELECT * FROM comments
        WHERE comment_id=$1
    `,
            [id]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Comment not found" });
            else return rows[0];
        });
};

exports.updateCommentById = (id, inc_votes) => {
    return db
        .query(
            `
        UPDATE comments
        SET votes = votes + $2
        WHERE comment_id=$1
        RETURNING *
    ;`,
            [id, inc_votes]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Comment not found" });
            else return rows[0];
        });
};

exports.removeCommentById = (id) => {
    return db
        .query(
            `
        DELETE FROM comments
        WHERE comment_id=$1
        RETURNING *
    ;`,
            [id]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Comment not found" });
        });
};
