import { Conversation } from "../models/conversationModel.js";
import mongoose, { Mongoose } from "mongoose";

export const getConversation = async (req, res) => {
    try {
        const { sender, receiver } = req.query;
        if (!sender || !receiver) {
            return res.status(400).json({
                success: false,
                message: "Sender and receiver are required"
            })
        }

        const conversation = await Conversation.findOne({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        }).populate("messages").sort({ updateAt: -1 })

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "conversation retrive successfully!",
            data: conversation
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "conversation retrive failed!",
            data: null
        })
    }
};

export const getAllConversations = async (req, res) => {
    try {
        const { sender } = req.query;
        if (!sender) {
            return res.status(400).json({
                success: false,
                message: "Sender is required"
            })
        }

        const conversation = await Conversation.find({
            $or: [
                { sender: sender },
                { receiver: sender }
            ]
        }, {
            receiver: 1,
            messages: { $slice: -1 } // Include only the last element of the messages array
        }).populate([
            {
                path: "receiver",
                select: "name email profilePic _id",
            },
            {
                path: "messages",
            }

        ]).sort({ createdAt: -1 })


        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversations not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "conversations retrive successfully!",
            data: conversation
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "conversations retrive failed!",
            data: null
        })
    }
};


export const findConversation = async (req, res) => {
    try {
        const { query, userId } = req.query;

        const conversations = await Conversation.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "receiver",
                    foreignField: "_id",
                    as: "receiver"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $match: {
                    $or: [
                        {
                            "sender.name": { $regex: query, $options: "i" },
                            "sender._id": new mongoose.Types.ObjectId(userId),
                        },
                        {
                            "sender.name": { $regex: query, $options: "i" },
                            "receiver._id": new mongoose.Types.ObjectId(userId),
                        },
                        {
                            "receiver.name": { $regex: query, $options: "i" },
                            "sender._id": new mongoose.Types.ObjectId(userId),
                        },
                        {
                            "receiver.name": { $regex: query, $options: "i" },
                            "receiver._id": new mongoose.Types.ObjectId(userId),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "messages",
                    foreignField: "_id",
                    as: "messageDetails"
                }
            },
            {
                $addFields: {
                    lastMessage: {
                        $arrayElemAt: ["$messageDetails", -1] // Extract the last message from the array
                    }
                }
            },
            {
                $addFields: {
                    userDetailsId: {
                        $cond: {
                            if: { $eq: ["$lastMessage.sender", new mongoose.Types.ObjectId(userId)] }, // Check if the last message sender is the current user
                            then: "$lastMessage.receiver", // If true, target the receiver
                            else: "$lastMessage.sender" // Otherwise, target the sender
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // Target the Users collection
                    localField: "userDetailsId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    userDetails: {
                        $arrayElemAt: ["$userDetails", 0] // Extract the first element (the matched user document)
                    }
                }
            },
            {
                $addFields: {
                    receiveMessages: {
                        $filter: {
                            input: "$messageDetails",
                            as: "message",
                            cond: {
                                $eq: ["$$message.receiver", new mongoose.Types.ObjectId(userId)]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    unseenMessages: {
                        $size: {
                            $filter: {
                                input: "$receiveMessages",
                                as: "message",
                                cond: {
                                    $eq: ["$$message.seen", false]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                    "userDetails._id": 1,
                    unseenMessages: 1,
                    lastMessage: 1,
                    updatedAt: 1,
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort conversations by creation date
            }
        ])

        res.status(200).json({
            success: true,
            users: conversations
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching conversations"
        })
    }
};

