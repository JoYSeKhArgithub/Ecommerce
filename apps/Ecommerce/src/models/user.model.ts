import mongoose, { Schema } from "mongoose";
import { USERTYPE } from "../utils";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Plaese fill a valid email"],
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 10,
    },
    following: [{
        type: String
    }],
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    phoneNumber: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 10
    },
    country: {
        type: String,
        trim: true
    },
    userType: {
        type: String,
        enum: [USERTYPE.SELLER, USERTYPE.USER],
        default: USERTYPE.USER
    },

}, { timestamps: true });


const User = mongoose.model('User', userSchema);
export default User;

