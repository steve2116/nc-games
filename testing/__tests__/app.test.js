const testData = require("../../db/data/test-data/index.js");
const seed = require("../../db/seeds/seed.js");
const db = require("../../db/connection.js");

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    db.end();
});

require("../app/api.js");
require("../app/api.categories.js");
require("../app/api.reviews.js");
require("../app/api.users.js");
require("../app/api.comments.js");
