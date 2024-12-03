import mongoose from "mongoose";

const StatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file:{
        fileType: {
            type: String,
            required: true
        },
        fileUrl:{
            type: String,
            required: true
        },
        fileDuration:{
            type: Number,
            required: true
        }
    },
    message: {
        type: String,
        default: ''
    },
    seen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const Status = mongoose.model("Status", StatusSchema);
export default Status;