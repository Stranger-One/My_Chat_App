import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    callerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: String,
    },
    duration: {
        type: Number,
        default: 0
    },
    callType: {
        type: String,
        enum: ['voice', 'video'],
        default: 'video'
    },
    status: {
        type: String,
        enum: ['missed', 'incoming', 'outgoing', 'declined', 'answered'],
        default: 'answered'
    }
},{
    timestamps: true
});

const Call = mongoose.model('Call', callSchema);

export default Call;