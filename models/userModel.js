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
    intro_score:{
        type:Number,
        default:0
    },
    approach_score:{
        type:Number,
        default:0
    },
    coding_score:{
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