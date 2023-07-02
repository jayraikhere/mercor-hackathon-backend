import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        distinct: true
    },
    score:{
        type:Number,
        default:0
    },
    password: {
        type: String,
        required: true
    },
});

const userModel = mongoose.model('userModel', userSchema);

export default userModel;