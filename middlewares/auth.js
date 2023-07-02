import jwt from 'jsonwebtoken';
import { Err } from '../helpers/errorhandler.js';
import dotenv from "dotenv";
dotenv.config();

export const auth = (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];

    if(token)
    req.user = jwt.verify(token, process.env.hashtoken);
    next();

};
