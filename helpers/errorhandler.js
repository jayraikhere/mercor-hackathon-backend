export const errorHandler = (err, req, res, next) => {
    console.log(err);
    return res.status(err.status).json({ err });
};

export class Err extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
};