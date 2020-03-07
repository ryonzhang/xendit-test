'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const expressSwagger = require('express-swagger-generator')(app);
const {RideError,errorHandler} = require('./error-handler');

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
    app.post('/rides', jsonParser, (req, res, next) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            throw new RideError('VALIDATION_ERROR','Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            throw new RideError('VALIDATION_ERROR','End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            throw new RideError('VALIDATION_ERROR','Rider name must be a non empty string');
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            throw new RideError('VALIDATION_ERROR','Driver name must be a non empty string');
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            throw new RideError('VALIDATION_ERROR','Driver Vehicle must be a non empty string');
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return next(new RideError('SERVER_ERROR','Unknown error'));
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return next(new RideError('SERVER_ERROR','Unknown error',res));
                }

                res.send(rows);
            });
        });
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
    app.get('/rides', (req, res, next) => {
        const page = req.query.page && Number(req.query.page)>=1? Number(req.query.page): 1;
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const offset = (page-1)*limit;
        db.all(`SELECT * FROM Rides LIMIT ${limit} OFFSET ${offset}`, function (err, rows) {
            if (err) {
                return next(new RideError('SERVER_ERROR','Unknown error',res));
            }

            if (rows.length === 0) {
                return next(new RideError('SERVER_ERROR','Unknown error',res));
            }

            res.send(rows);
        });
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
    app.get('/rides/:id', (req, res,next) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return next(new RideError('SERVER_ERROR','Unknown error'));
            }

            if (rows.length === 0) {
                return next(new RideError('RIDES_NOT_FOUND_ERROR','Could not find any rides'));
            }

            res.send(rows);
        });
    });

    app.use(errorHandler);

    return app;
};
