const db = require("../db/connection.js");
const sort_byWL = require("../Queries/api.reviews/sort_byWL.js");

exports.selectReviews = ({ category, sort_by, order }) => {
    if (!sort_byWL.includes(sort_by)) sort_by = "created_at";
    if (order !== "asc") order = "desc";
    const queryArray = [];
    if (category) queryArray.push(category);
    let queryString = `
        SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comment_id) AS comment_count
        FROM reviews
        LEFT JOIN comments
        ON reviews.review_id = comments.review_id${
            category ? "\nWHERE category=$1" : ""
        }
        GROUP BY reviews.review_id
        ORDER BY ${sort_by} ${order.toUpperCase()}
    ;`;
    return db.query(queryString, queryArray).then(({ rows }) => {
        return rows;
    });
};
