const db = require("../db/connection.js");

exports.selectReviews = () => {
    return db
        .query(
            `
        SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comment_id) AS comment_count
        FROM reviews
        LEFT JOIN comments
        ON reviews.review_id = comments.review_id
        GROUP BY reviews.review_id
        ORDER BY created_at DESC
    ;`
        )
        .then((data) => {
            return data.rows;
        });
};
