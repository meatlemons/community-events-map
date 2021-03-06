const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'community-events'
});

const ERROR_MESSAGES = {
    create: "Something went wrong while creating an event: ",
    read: "Something went wrong while getting events: ",
    delete: "Something went wrong while deleting an event: "
};

const DEFAULT_SUCCESS_RESPONSE = {
    code: 0,
    message: "Success"
}

connection.connect(function(err) {
    if (err) {
        console.error("Cannot connect to MySQL: ", err.stack);
        return;
    }

    console.info("Connected to MySQL with ID: ", connection.threadId);
});

// ping test
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// get list of events
app.get('/api/events', (req, res) => {
    const GET_EVENTS = `SELECT * FROM events`;
    let response;
    connection.query(GET_EVENTS, function(err, result) {
        if (err) {
            response = {
                result: [],
                code: -1,
                message: ERROR_MESSAGES.read + err
            }
            console.log(`GET events failed with: ${message}`);
            res.status(500).json(response);
        } else {
            response = {
                result,
                ...DEFAULT_SUCCESS_RESPONSE
            }
            console.log(`Retrieved events with message: ${response.message}`);
            res.status(200).json(response);
        }
    });
});

// create an event
app.post('/api/event', (req, res) => {
    const CREATE_EVENT = `
    INSERT INTO events (
        EventTitle, 
        StartDateTime, 
        ExpiryDateTime, 
        \`Description\`,
        ContactEmail,
        ContactTelephone,
        GeoLocation,
        Tags
    )
    VALUES (
        "${req.body.title}",
        "${req.body.startDateTime}",
        "${req.body.expiryDateTime}",
        "${req.body.description}",
        "${req.body.contactEmail}",
        "${req.body.contactTelephone}",
        POINT(${req.body.geolocation.x}, ${req.body.geolocation.y}),
        '[${req.body.tags}]'
    )
    `;
    console.log(`Creating a new event with the following query:\n${CREATE_EVENT}`);
    let response;
    connection.query(CREATE_EVENT, function(err, result) {
        if(err) {
            response = {
                code: -1,
                message: ERROR_MESSAGES.create + err
            }
            res.status(500).json(response);
        } else {
            response = DEFAULT_SUCCESS_RESPONSE;
            res.status(200).json(response);
        }
    });
});

// delete an event
app.delete('/api/event', (req, res) => {
    const eventId = req.query.eventId;
    console.log(`Event with ID ${eventId} queued for deletion.`);

    const DELETE_EVENT = `
    DELETE FROM events
        WHERE eventID = ${eventId}
    `;
    let response;
    connection.query(DELETE_EVENT, function(err, result) {
        if (err) {
            response = {
                code: -1,
                message: ERROR_MESSAGES.delete + err
            }
            console.log(response);
            res.status(500).json(response);
        } else {
            response = DEFAULT_SUCCESS_RESPONSE;
            console.log(response);
            res.status(200).json(response);
        }
    })
});

app.listen(port, () => {
  console.log(`Listening on ${port}`)
});
