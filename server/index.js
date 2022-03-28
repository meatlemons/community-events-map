const express = require('express');
var cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'community-events'
});

const GET_EVENTS = `SELECT * FROM events`;

connection.connect(function(err) {
    if (err) {
        console.error("Cannot connect to MySQL: ", err.stack);
        return;
    }

    console.info("Connected to MySQL with ID: ", connection.threadId);
});

// ping test
app.get('/api/ping', (req, res) => {
  res.send('pong')
})

// get events
app.get('/api/events', (req, res) => {
    let response;
    connection.query(GET_EVENTS, function(err, result) {
        if (err) {
            response = {
                result: [],
                code: -1,
                message: "Something went wrong: " + err
            }
            res.status(500).json(response);
        }

        response = {
            result,
            code: 0,
            message: "Success"
        }
        res.status(200).json(response);
    });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})