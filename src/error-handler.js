const logger = require('./logger');

class RideError extends Error {
    constructor(error_code,message){
        super(message);
        this.error_code = error_code;
    }
}

const errorHandler = async (err, req, res)=>{
    logger.error(`ERROR ${err.error_code}:${err.message}`);
    res.status(500).send({
        error_code: err.error_code,
        message: err.message
    });
};

module.exports = {
    RideError,
    errorHandler
};
