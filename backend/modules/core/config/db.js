const mongoose = require('mongoose');
const createLogger = require('core/logger/withContext');

const logger = createLogger('Mongo');
require('dotenv').config({ path: __dirname + '/config.env' });
const connection = () =>{
    mongoose.connect(process.env.db_URL).then(data =>{
        logger.info("Database Connected",data.connection.host)
    })
}
module.exports = connection;