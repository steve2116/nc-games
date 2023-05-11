const db = require("../db/connection.js");
const format = require("pg-format");

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
                .then((data) => data.rows);
        } else return Promise.reject({ code: 404, msg: "Review not found" });
    });
};

exports.insertCommentByReviewId = (id, comment) => {
    if (!comment.username)
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    const commentToFormat = [
        "body" in comment ? comment.body : "",
        id,
        comment.username,
        0,
        new Date(),
    ];
    const commentToInsert = format(
        `
            INSERT INTO comments
                (body, review_id, author, votes, created_at)
            VALUES
                %L
            RETURNING *
        ;`,
        [commentToFormat]
    );
    return db.query(commentToInsert).then((data) => {
        return data.rows[0];
    });
};

function checkIdExists(id) {
    return db
        .query(
            `
    SELECT review_id FROM reviews WHERE review_id=$1;`,
            [id]
        )
        .then((data) => !(data.rows.length === 0));
}
