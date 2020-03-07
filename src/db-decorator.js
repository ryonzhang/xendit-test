const util = require('util');
const {RideError} = require('./error-handler');

module.exports = (db) => {
    const all = async (statement, params, next) => {
        const promised = (util.promisify(db.all)).bind(db);
        try {
            const rows = await promised(statement, params);
            if (rows.length === 0) {
                return next(new RideError('RIDES_NOT_FOUND_ERROR','Could not find any rides'));
            }
            return rows;
        } catch (error) {
            return next(new RideError('SERVER_ERROR','Unknown error'));
        }
    };
    const query = (statement, params,next) => {
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            db.run(statement, params, function (err) {
                if (err) return next(new RideError('SERVER_ERROR','Unknown error'));
                resolve(this.lastID);
            });
        });
    };

    return { all, query };
};
