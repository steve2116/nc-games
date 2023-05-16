const db = require("../db/connection.js");

exports.selectCategoryBySlug = (slug) => {
    return db
        .query(
            `
        SELECT * FROM categories
        WHERE slug=$1
    ;`,
            [slug]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Category not found" });
            else return rows[0];
        });
};

exports.updateCategoryBySlug = (slug, { description }) => {
    if (!description)
        return Promise.reject({
            code: 400,
            msg: "Insufficient information to make request",
        });
    return db
        .query(
            `
        UPDATE categories
        SET description = $2
        WHERE slug=$1
        RETURNING *
    ;`,
            [slug, description]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Category not found" });
            else return rows[0];
        });
};

exports.removeCategoryBySlug = (slug) => {
    return db
        .query(
            `
            SELECT slug FROM categories
            WHERE slug=$1
        `,
            [slug]
        )
        .then(({ rows }) => {
            if (rows.length === 0)
                return Promise.reject({ code: 404, msg: "Category not found" });
            else
                return db.query(
                    `
            SELECT review_id FROM reviews
            WHERE category=$1
        ;`,
                    [slug]
                );
        })
        .then(({ rows }) => {
            if (rows.length === 0) return Promise.resolve([rows]);
            const reviewPromises = [rows];
            rows.forEach(({ review_id }) => {
                reviewPromises.push(
                    db.query(`
            DELETE FROM comments
            WHERE review_id=${review_id}
        ;`)
                );
            });
            return Promise.all(reviewPromises);
        })
        .then(([rows]) => {
            if (rows.length === 0) return Promise.resolve();
            return Promise.all(
                rows.map(({ review_id }) => {
                    return db.query(`
                        DELETE FROM reviews
                        WHERE review_id=${review_id}
                    ;`);
                })
            );
        })
        .then(() => {
            return db.query(
                `
                DELETE FROM categories
                WHERE slug=$1
            ;`,
                [slug]
            );
        });
};
