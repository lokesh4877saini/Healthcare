const mongoose = require('mongoose');
const createLogger = require('core/logger/withContext');
const path = require("path");

const logger = createLogger('Mongo');
require("dotenv").config({path: path.resolve(__dirname, "../../../config/config.env")});
const connection = () => {
    if (!process.env.db_URL) {
        logger.error("db_URL is missing! Check your .env file.");
        process.exit(1);
    }

    mongoose
        .connect(process.env.db_URL)
        .then((conn) => {
            logger.info(`Database Connected: ${conn.connection.host}`);
        })
        .catch((err) => {
            logger.error("Database Connection Failed", err);
        });
};

module.exports = connection;
