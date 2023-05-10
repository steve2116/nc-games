const db = require("../db/connection.js");

exports.selectCommentsByReviewId = (id) => {
    return checkIdExists(id).then((exist) => {
        if (exist) {
            return db
                .query(
                    `
                SELECT comment_id, votes, created_at, author, body, review_id
                FROM comments
                WHERE review_id=$1
                ORDER BY created_at DESC
            ;`,
                    [id]
                )
                .then((data) => {
                    return data.rows;
                });
        } else return Promise.reject({ code: 404, msg: "Review not found" });
    });
};

function checkIdExists(id) {
    return db
        .query(
            `
    SELECT review_id FROM reviews WHERE review_id=$1;`,
            [id]
        )
        .then((data) => {
            return !(data.rows.length === 0);
        });
}
