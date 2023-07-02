import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import userModel from "../models/userModel.js";
import { Err } from "../helpers/errorhandler.js";

export const userLogin = (req, res, next) => {
    const { email, password } = req.body;
    userModel.findOne({ email:email })
        .then((data) => {
            console.log(data);
            if (data) {
                bcrypt.compare(password, data.password)
                    .then((check) => {

                        if (check) {
                            const token = jwt.sign({ name: data.name, _id: data._id, email: data.email }, process.env.hashtoken);
                            return res.status(200).json({ token, name: data.name, _id: data._id,email: data.email, message: "You are logged in successfully." });
                        }
                        else
                            throw new Err('Invalid Credentials.', 403);
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
            else
                throw new Err("Email does not exist.", 403);
        })
        .catch((err) => {
            next(err);
        });
};

export const userSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
 
    await userModel.findOne({ email:email })    
    .then((data) => {
        if (data) {
                throw new Err("Email entered is already registered with us.", 403);
                // next(err);
        }
        else
        {
            bcrypt.hash(password, 4)
            .then((hash) => {
                userModel.create({ name,email, password: hash })
                    .then((data) => {
                        
                        const token = jwt.sign(
                            { name: data.name, _id: data._id, email: data.email },
                            process.env.hashtoken
                        );
    
                        return res.status(200).json({ token, email: data.email, name: data.name, _id: data._id, message: "You are signuped successfully." });
                    })
                    .catch((err) => {
                        next(err);
                    });
            })
            .catch((err) => {
                next(err);
            });
        }
    })
    .catch((err) => {
        next(err);
    });
   
};



