# Northcoders House of Games API

## Hosted site

If you would like to see this API online, please go to:

https://chatmat.onrender.com/api

## Summary

This project is provided by NorthCoders. It's goal is to provide a platform to host a review board on games, and to allow people to leave comments on the reviews.

More features may be added in the future, however for now you can see all the endpoints on the link specified above.

## Setup Instructions

1. First clone the repository:

    ```
    git clone https://github.com/steve2116/be-nc-games.git
    ```

2. You will also need to download dependencies and create a database to use:

    ```
    npm install
    npm run setup-dbs
    ```

    (You should set up environment variables at this point)

3. To seed the database:

    ```
    npm run seed
    ```

4. To run tests:
    ```
    npm run test app.test.js
    ```

## Environment variables

You will need to add your own environment variables, including:

-   Development database (.env.development) > PGDATABASE=nc_games
-   Test database (.env.test) > PGDATABASE=nc_games_test

If you would like to use your own databases, change the files to contain PGDATABASE=<database_name> instead, as well as changing "/db/setup.sql" to match these changes.

## Requirements

You will need to have:

-   Node between version v14.15 and v15 or higher than v16
-   PostgreSQL version higher than v14.7 (earlier versions may be supported. It has not been tested, however it was built using the specified version)

(This is also in package.json under "engines")
