const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/config.env' });
const connection = () =>{
    mongoose.connect(process.env.db_URL).then(data =>{
        console.log("Database Connected",data.connection.host)
    })
}
module.exports = connection;