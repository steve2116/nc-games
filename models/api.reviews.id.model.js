const db = require("../db/connection.js");

exports.selectReviewById = (id) => {
    return db
        .query(
            `
        SELECT reviews.review_id, title, review_body, designer, review_img_url, reviews.votes, category, owner, reviews.created_at, COUNT(comment_id) AS comment_count
        FROM reviews
        JOIN comments
        ON reviews.review_id = comments.review_id
        WHERE reviews.review_id=$1
        GROUP BY reviews.review_id
    ;`,
            [id]
        )
        .then((data) => {
            if (data.rows.length === 0) {
                return Promise.reject({ code: 404, msg: "Review not found" });
            } else return data.rows[0];
        });
};

exports.updateReviewById = (id, inc_votes) => {
    return db
        .query(
            `
        UPDATE reviews
        SET votes = votes + $2
        WHERE review_id = $1
        RETURNING *
    ;`,
            [id, inc_votes]
        )
        .then((data) => {
            if (data.rows.length === 0) {
                return Promise.reject({ code: 404, msg: "Review not found" });
            } else return data.rows[0];
        });
};

exports.removeReviewById = (id) => {
    return db
        .query(
            `
        DELETE FROM comments
        WHERE review_id=$1
    ;`,
            [id]
        )
        .then(() => {
            return db.query(
                `
            DELETE FROM reviews
            WHERE review_id=$1
            RETURNING review_id
        ;`,
                [id]
            );
        })
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Review not found" });
        });
};
