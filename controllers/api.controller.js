module.exports = (request, response) => {
    return response.status(200).send({
        endpoints: {
            "/api": {
                get: {
                    status: "OK",
                    info: "An object of all endpoints",
                    data: "Each endpoint object contains the methods avaliable with information on each.",
                    keys: ["/api", "/api/categories"],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: null,
                },
            },
            "/api/categories": {
                get: {
                    status: "OK",
                    info: "An array of categories",
                    data: "Each category element as an object",
                    keys: ["slug", "description"],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        categories: [
                            {
                                slug: "euro game",
                                description:
                                    "Abstact games that involve little luck",
                            },
                            {
                                slug: "social deduction",
                                description:
                                    "Players attempt to uncover each other's hidden role",
                            },
                        ],
                    },
                },
            },
            "/api/review/:review_id": {
                get: {
                    status: "OK",
                    info: "A review object with a specified id",
                    data: "The review requested through a parametric endpoint",
                    keys: [
                        "review_id",
                        "title",
                        "review_body",
                        "designer",
                        "review_img_url",
                        "votes",
                        "category",
                        "owner",
                        "created_at",
                    ],
                    queries: [],
                    "req-body": "none",
                    "res-body": "json",
                    example: {
                        review: {
                            review_id: 2,
                            title: "JengARRGGGH!",
                            review_body:
                                "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
                            designer: "Leslie Scott",
                            review_img_url:
                                "https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700",
                            votes: 5,
                            category: "dexterity",
                            owner: "grumpy19",
                            created_at: "2021-01-18T10:01:41.251Z",
                        },
                    },
                },
            },
        },
    });
};
