const db = require("../db/connection.js");

exports.selectReviews = ({ category }) => {
    let queryString = `
        SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comment_id) AS comment_count
        FROM reviews
        LEFT JOIN comments
        ON reviews.review_id = comments.review_id
        ${category ? "WHERE category=$1" : ""}
        GROUP BY reviews.review_id
        ORDER BY created_at DESC
    ;`;
    const queryArray = [];
    if (category) queryArray.push(category);
    return db.query(queryString, queryArray).then((data) => {
        return data.rows;
    });
};
