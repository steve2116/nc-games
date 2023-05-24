const db = require("../db/connection.js");
const format = require("pg-format");
const sort_byWL = require("../Queries/api.reviews.id.comments/sort_byWL.js");

exports.selectCommentsByReviewId = (
    id,
    { limit, p, sort_by, order, author }
) => {
    return checkIdExists(id).then((exist) => {
        if (exist) {
            if (isNaN(limit) || limit < 1 || limit % 1 !== 0) limit = 10;
            if (isNaN(p) || p < 1 || p % 1 !== 0) p = 1;
            if (!sort_byWL.includes(sort_by)) sort_by = "created_at";
            if (!["asc", "desc"].includes(order))
                order = ["created_at", "votes"].includes(sort_by)
                    ? "desc"
                    : "asc";
            order = order.toUpperCase();
            const queryArray = [id];
            if (author) queryArray.push(author);
            return db
                .query(
                    `
                SELECT comment_id, votes, created_at, author, body, review_id
                FROM comments
                WHERE review_id=$1${author ? " AND author=$2" : ""}
                ORDER BY ${sort_by} ${order}
                LIMIT ${limit} OFFSET ${(p - 1) * limit}
            ;`,
                    queryArray
                )
                .then(({ rows }) => rows);
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
