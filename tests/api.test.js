'use strict';
const request = require('supertest');
const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);
            for (let i=0; i < 10; i++) {
                db.run(`
                    INSERT INTO Rides (startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [11, 22, 33, 44, 'Ruiyang Zhang', 'Ryon', 'Voiture']);
            }

            done();
        });
    });

    describe('GET /health', () => {
        it('should be healthy', (done) => {
            request(app)
                .get('/health')
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        it('should insert ride record', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 55,
                    start_long: 66,
                    end_lat: 77,
                    end_long: 88,
                    rider_name: 'Mary Magic',
                    driver_name: 'Howard',
                    driver_vehicle: 'Volks Wagon',
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body[0].rideID, 11);
                    done();
                });
        });

        it('should validate failure on latitude', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 181,
                    start_long: 2,
                    end_lat: 3,
                    end_long: 4,
                    rider_name: 'Kongfu Panda',
                    driver_name: 'Xi',
                    driver_vehicle: 'POKER',
                })
                .expect(500, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                }, done);
        });

        it('should require non-empty driver name', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 80,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: 'Kafka',
                    driver_name: '',
                    driver_vehicle: 'Jenkins',
                })
                .expect(500, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver name must be a non empty string',
                }, done);
        });

        it('should require non-empty rider name', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 80,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: '',
                    driver_name: 'Colin',
                    driver_vehicle: 'Jenkins',
                })
                .expect(500, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Rider name must be a non empty string',
                }, done);
        });

        it('should require non-empty driver vehicle', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 80,
                    start_long: 80,
                    end_lat: 80,
                    end_long: 80,
                    rider_name: 'Kafka',
                    driver_name: 'Colin',
                    driver_vehicle: '',
                })
                .expect(500, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'Driver Vehicle must be a non empty string',
                }, done);
        });
    });

    describe('GET /rides with pagination', () => {
        it('should return ride records with default limit', (done) => {
            request(app)
                .get('/rides')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 5);
                    done();
                });
        });

        it('should return ride records with limit 10', (done) => {
            request(app)
                .get('/rides?limit=10')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 10);
                    done();
                });
        });

        it('should return ride records with limit 3 page 3', (done) => {
            request(app)
                .get('/rides?limit=3&page=3')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.equal(res.body.length, 3);
                    assert.equal(res.body[0].rideID, 7);
                    done();
                });
        });
    });

    describe('GET /rides/{id}', () => {
        it('should return a ride', (done) => {
            request(app)
                .get('/rides/1')
                .expect(200, done);
        });

        it('should return error when not found', (done) => {
            request(app)
                .get('/rides/1000')
                .expect(500, {
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides',
                }, done);
        });
    });
});
