import { Conversation, Message } from "../models/conversationModel.js";
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
        }).populate({
            path: "messages",
            populate: {
                path: "replyTo",
                select: "text file sender createdAt"
            }
        }).sort({ updatedAt: -1 })

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

export const deleteConversation = async (req, res) => {
    try {
        const {conversationId} = req.params;

        if(!conversationId){
            return res.status(400).json({
                success: false,
                message: "Please provide conversation id"
                })
        }

        await Conversation.findByIdAndDelete(conversationId)
        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully"
        })
    
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Conversation deleted failed",
            error
        })
    }
};

export const reactToMessage = async (req, res) => {
    try {
        const { messageId, emoji, userId } = req.body;
        if (!messageId || !emoji || !userId) {
            return res.status(400).json({
                success: false,
                message: "messageId, emoji and userId are required"
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        if (!message.reactions) {
            message.reactions = [];
        }

        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.user.toString() === userId.toString()
        );

        if (existingReactionIndex > -1) {
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Remove reaction if clicked the same emoji again
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Change emoji
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            message.reactions.push({ emoji, user: userId });
        }

        await message.save();

        res.status(200).json({
            success: true,
            message: "Reaction updated successfully",
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to react to message",
            error: error.message
        });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { deleteForEveryone, userId } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        if (deleteForEveryone) {
            if (message.sender.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Only sender can delete for everyone"
                });
            }
            message.isDeleted = true;
            message.text = "This message was deleted";
            message.file = { fileName: "", fileType: "", fileUrl: "", fileSize: 0 };
        } else {
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
            }
        }

        await message.save();

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: error.message
        });
    }
};

export const clearChat = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        // Add userId to deletedFor for all messages in conversation
        await Message.updateMany(
            { _id: { $in: conversation.messages } },
            { $addToSet: { deletedFor: userId } }
        );

        res.status(200).json({
            success: true,
            message: "Chat cleared successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to clear chat",
            error: error.message
        });
    }
};

