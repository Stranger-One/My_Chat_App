import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        default: ""
    },
    file: {
        fileName:{
            type: String,
            default:""
        },
        fileType: {
            type: String,
            default: ""
        },
        fileUrl: {
            type: String,
            default: ""
        },
        fileSize: {
            type: Number,
            default: 0
        }
    },
    seen: {
        type: Boolean,
        default: false
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    reactions: [
        {
            emoji: { type: String, required: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    callInfo: {
        type: Object,
        default: null
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    }
})

const conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true
        }
    ]
}, {
    timestamps: true
})
const Message = mongoose.model("Message", messageSchema)
const Conversation = mongoose.model("Conversation", conversationSchema);
export { Message, Conversation }
