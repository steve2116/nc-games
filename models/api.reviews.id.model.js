const db = require("../db/connection.js");

exports.selectReviewById = (id) => {
    return db
        .query(
            `
        SELECT review_id, title, review_body, designer, review_img_url, votes, category, owner, created_at
        FROM reviews
        WHERE review_id=$1
    `,
            [id]
        )
        .then((data) => {
            if (data.rows.length === 0) {
                return Promise.reject({ code: 404, msg: "Review not found" });
            } else return data.rows[0];
        });
};