import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema({
    field_id:{
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
},{timestamps: true});

const Image = mongoose.model('Image', imageSchema);
export default Image;