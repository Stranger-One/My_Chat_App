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
        type: Date
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: {
            values: ['missedCall', 'incommingCall', 'outgoingCall'],
            message: '{VALUE} is not supported'
        },
        required: true
    }
});

const Call = mongoose.model('Call', callSchema);

export default Call;