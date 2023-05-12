const db = require("../db/connection.js");
const sort_byWL = require("../Queries/api.reviews/sort_byWL.js");
const format = require("pg-format");

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
    return db.query(queryString, queryArray).then(({ rows }) => rows);
};

exports.insertReview = ({
    owner,
    title,
    review_body,
    designer,
    category,
    review_img_url,
}) => {
    if (!(owner && title && review_body && designer && category))
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    const formatArray = [owner, title, review_body, designer, category];
    if (review_img_url) formatArray.push(review_img_url);
    const queryString = format(
        `
        INSERT INTO reviews
            (owner, title, review_body, designer, category${
                review_img_url ? ", review_img_url" : ""
            })
        VALUES
            %L
        RETURNING *
    ;`,
        [formatArray]
    );
    return db.query(queryString).then(({ rows }) => {
        return { ...rows[0], comment_count: 0 };
    });
};
