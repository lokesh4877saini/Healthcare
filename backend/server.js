const app = require('./app');
require('dotenv').config({ path: "./config/config.env" })
const connection = require('./config/db');
const PORT = process.env.PORT || 4001;
// connecting with database
connection();
app.get('/', (req, res) => {
    res.send("okey");
})
app.get('/rahul', (req, res) => {
    res.send(
        `
        <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta http-equiv="X-UA-Compatible" content="IE=edge">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Document</title>
       </head>
       <body>
           <h1>Hello Rahul ky hal chal</h1>
       </body>
       </html>
  `     
    );
})
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
//   });
  
app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
      
// suppose config.env we wrongly type data connection string then we caught error and our server will down 
// it is called unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error : ${err}`);
    console.log('Error:', err);
    console.log('Error message:', err.message);
    console.log('Error stack:', err.stack);
    console.log("Shutting down the server due to unhandled Promise Rejection")
    server.close(() => {
        process.exit(1);
    });
})