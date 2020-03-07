'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const expressSwagger = require('express-swagger-generator')(app);
const {errorHandler} = require('./error-handler');
const validator = require('./validator')


let options = {
    swaggerDefinition: {
        info: {
            description: 'This server is a micro service for maintaining the rides information',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: '0.0.0.0:8010',
        basePath: '/',
        validatorUrl: null,
        produces: [
            'application/json',
            'text/plain'
        ],
        schemes: ['http', 'https'],
    },
    basedir: __dirname,
    files: ['./*.js']
};
expressSwagger(options);




module.exports = (db) => {
    const {all,query} = require('./db-decorator')(db);

    /**
     * Health Check endpoint
     * This endpoint is specifically for the kubernetes or other infrastructure services to detect whether this microservice is alive or not, a response of pure text of 'Healthy' will render it healthy and not otherwise
     * @route GET /health
     * @produces text/html
     * @returns {String} 200 - Healthy
     */
    app.get('/health', (req, res) => res.send('Healthy'));


    /**
     * @typedef Ride
     * @property {number} start_lat.required - Starting latitude of the ride - eg: 45
     * @property {number} start_long.required - Starting longitude of the ride - eg: 37
     * @property {number} end_lat.required - Ending latitude of the ride - eg: 29
     * @property {number} end_long.required - Ending longitude of the ride - eg: 57
     * @property {string} rider_name.required - Rider's name - eg: Ryon Zhang
     * @property {string} driver_name.required - Driver's name - eg: Paul Ryon
     * @property {string} driver_vehicle.required - Driver's vehicle - eg: Volks Wagen
     */

    /**
     * @typedef Response
     * @property {number} rideID - The ID of this ride - eg: 1242
     * @property {number} startLat - Starting latitude of the ride - eg: 45
     * @property {number} startLong - Starting longitude of the ride - eg: 37
     * @property {number} endLat - Ending latitude of the ride - eg: 29
     * @property {number} endLong - Ending longitude of the ride - eg: 57
     * @property {string} riderName - Rider's name - eg: Ryon Zhang
     * @property {string} driverName - Driver's name - eg: Paul Ryon
     * @property {string} driverVehicle - Driver's vehicle - eg: Volks Wagen
     * @property {date} created - Time of the record being created - eg: 2020-03-07 10:33:11
     */

    /**
     * @typedef Error
     * @property {string} error_code
     * @property {string} message
     */

    /**
     * Insert a record of ride information
     * This endpoint is for inserting the sanitated and validated Ride record
     * @route POST /rides
     * @param {Ride.model} ride.body.required - the new ride
     * @produces application/json
     * @consumes application/json
     * @returns {Array.<Response>} 200 - The rides with the same ID of the latest inserted ride
     * @returns {Error.model} 500 - The error message regarding sanitation,validation or DB operation
     */
    app.post('/rides', jsonParser, async(req, res, next) => {
        const values = await validator.validateRide(req.body,next);
        const lastID = await query('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values,next);
        const rows = await all('SELECT * FROM Rides WHERE rideID = ?', [lastID],next);
        res.send(rows);
    });

    /**
     * Get all rides
     * This endpoint is for obtaining all records of rides by pagination, for instance, if to retrieve records from 21-30, you can set limit to 10 (limit=10, default 5) and take the third page (page=3, default 1)
     * @route GET /rides
     * @param {number} page.query - the page of ride records
     * @param {number} limit.query - the number of records on one page
     * @produces application/json
     * @returns {Array.<Response>} 200 - The rides with the same ID of the latest inserted ride
     * @returns {Error.model} 500 - The error message regarding sanitation,validation or DB operation
     */
    app.get('/rides', async(req, res, next) => {
        const page = req.query.page && Number(req.query.page)>=1? Number(req.query.page): 1;
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const offset = (page-1)*limit;
        const rows = await all('SELECT * FROM Rides LIMIT ? OFFSET ?', [limit, offset],next);
        res.send(rows);
    });

    /**
     * Get a record of ride for certain ID
     * This endpoint is for obtaining the ride record of a specific ID
     * @route GET /rides/{id}
     * @param {number} id.path.required - the ID of ride
     * @produces application/json
     * @returns {Array.<Response>} 200 - The rides with the same ID of the latest inserted ride
     * @returns {Error.model} 500 - The error message regarding sanitation,validation or DB operation
     */
    app.get('/rides/:id', async(req, res,next) => {
        const rows = await all('SELECT * FROM Rides WHERE rideID=?', [req.params.id],next);
        res.send(rows);
    });

    app.use(errorHandler);

    return app;
};
