import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js'
import User from '../models/userModel.js'
import { Conversation, Message } from '../models/conversationModel.js'
import mongoose from 'mongoose'
import Status from '../models/StatusModel.js'
import dotenv from "dotenv";
dotenv.config();

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
})

const users = {}; // Store connected users and their peer IDs
const onlineUsers = new Set()

io.on("connection", async (socket) => {
    console.log("Client connected", socket.id);
    // console.log("socket.handshake", socket.handshake);

    // get token
    const token = socket.handshake.auth.token;
    // console.log("token", token);

    // get user details from token
    const userDetails = await getUserDetailsFromToken(token);
    // console.log("user", userDetails);

    // create room
    socket.join(userDetails?._id)
    onlineUsers.add(userDetails?._id)

    // send to client side
    io.emit("onlineUsers", Array.from(onlineUsers))
    // console.log("onlineUsers", Array.from(onlineUsers));


    // on page load send all chats
    socket.on("request-all-conversation", async (userId) => {
        const getAllConversation = await Conversation.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { receiver: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $addFields: {
                    user: {
                        $cond: {
                            if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] }, // Check if sender matches
                            then: "$receiver", // Assign receiver if sender matches
                            else: "$sender" // Otherwise, assign sender
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // User collection
                    localField: "user",
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
                $lookup: {
                    from: "messages", // Messages collection
                    localField: "messages",
                    foreignField: "_id",
                    as: "messageDetails"
                }
            },
            {
                $addFields: {
                    unseenMessages: {
                        $size: {
                            $filter: {
                                input: "$messageDetails", // The array to filter
                                as: "message", // Alias for each element in the array
                                cond: {
                                    $and: [
                                        { $eq: ["$$message.seen", false] },
                                        { $eq: ["$$message.receiver", new mongoose.Types.ObjectId(userId)] }
                                    ]
                                } // Condition for filtering unseen messages
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$messageDetails", -1] } // Get the last message
                }
            },
            {
                $project: {
                    // sender: 1,
                    // receiver: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                    "userDetails._id": 1,
                    unseenMessages: 1,
                    lastMessage: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort conversations by creation date
            }
        ])
        // console.log("getAllConversation", getAllConversation);
        socket.emit("receive-all-conversation", getAllConversation)

    })

    socket.on("request-chat-messages", async (_id, userId) => {
        // console.log("message-page", _id)
        const user = await User.findById(_id).select("-password")

        const details = {
            name: user.name,
            email: user.email,
            _id: user._id,
            profilePic: user.profilePic,
            online: onlineUsers.has(_id)
        }
        socket.emit("chat-user-details", details)

        const conversation = await Conversation.findOne({
            $or: [
                { sender: userDetails?._id, receiver: _id },
                { sender: _id, receiver: userDetails?._id }
            ]
        }).populate("messages").sort({ createdAt: -1 })
        // console.log("conversation", conversation)

        socket.emit("receive-chat-messages", conversation)

    })

    socket.on("send-message", async (messageDetails) => {
        // create new message

        const message = new Message({
            sender: messageDetails?.sender,
            receiver: messageDetails?.receiver,
            text: messageDetails?.text,
            file: messageDetails?.file,
            createdAt: Date.now()
        })
        await message.save()

        // console.log("new message", message);

        // check conversation
        const matchConversation = await Conversation.findOne({
            $or: [
                {
                    sender: messageDetails?.sender,
                    receiver: messageDetails?.receiver
                },
                {
                    sender: messageDetails?.receiver,
                    receiver: messageDetails?.sender
                }
            ]
        })

        if (!matchConversation) {
            // create new conversation
            const newConversation = new Conversation({
                sender: messageDetails?.sender,
                receiver: messageDetails?.receiver,
                messages: [
                    message._id
                ]
            })
            await newConversation.save()

        } else {
            // update conversation
            await Conversation.updateOne({
                _id: matchConversation._id
            }, {
                $push: { messages: message._id }
            })
        }

        // get conversation
        const conversation = await Conversation.findOne({
            $or: [
                {
                    sender: messageDetails?.sender,
                    receiver: messageDetails?.receiver
                },
                {
                    sender: messageDetails?.receiver,
                    receiver: messageDetails?.sender
                }
            ]
        }).populate("messages").sort({ createdAt: -1 })
        // console.log("getConversation", getConversation)

        io.to(messageDetails?.sender).to(messageDetails?.receiver).emit("receive-chat-messages", conversation)

        const getAllConversationSender = await Conversation.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(messageDetails?.sender) },
                        { receiver: new mongoose.Types.ObjectId(messageDetails?.sender) }
                    ]
                }
            },
            {
                $addFields: {
                    user: {
                        $cond: {
                            if: { $eq: ["$sender", new mongoose.Types.ObjectId(messageDetails?.sender)] }, // Check if sender matches
                            then: "$receiver", // Assign receiver if sender matches
                            else: "$sender" // Otherwise, assign sender
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // User collection
                    localField: "user",
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
                $lookup: {
                    from: "messages", // Messages collection
                    localField: "messages",
                    foreignField: "_id",
                    as: "messageDetails"
                }
            },
            {
                $addFields: {
                    // unseenMessages: 0
                    unseenMessages: {
                        $cond: {
                            if: {
                                $or: [
                                    { $eq: ["$sender", new mongoose.Types.ObjectId(messageDetails.receiver)] },
                                    { $eq: ["$receiver", new mongoose.Types.ObjectId(messageDetails.receiver)] },
                                ]
                            }, // Check if sender matches
                            then: 0, // Assign receiver if sender matches
                            else: {
                                $size: {
                                    $filter: {
                                        input: "$messageDetails", // The array to filter
                                        as: "message", // Alias for each element in the array
                                        cond: {
                                            $and: [
                                                { $eq: ["$$message.receiver", new mongoose.Types.ObjectId(messageDetails.sender)] }, // Match sender ID
                                                { $eq: ["$$message.seen", false] } // Match unseen messages
                                            ]
                                        } // Condition for filtering unseen messages
                                    }
                                }
                            } // Otherwise, assign sender
                        }

                    }
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$messageDetails", -1] } // Get the last message
                }
            },
            {
                $project: {
                    // sender: 1,
                    // receiver: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                    "userDetails._id": 1,
                    unseenMessages: 1,
                    lastMessage: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort conversations by creation date
            }
        ])
        io.to(messageDetails?.sender).emit("receive-all-conversation", getAllConversationSender)

        const getAllConversationReceiver = await Conversation.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(messageDetails?.receiver) },
                        { receiver: new mongoose.Types.ObjectId(messageDetails?.receiver) }
                    ]
                }
            },
            {
                $addFields: {
                    user: {
                        $cond: {
                            if: { $eq: ["$sender", new mongoose.Types.ObjectId(messageDetails?.receiver)] }, // Check if sender matches
                            then: "$receiver", // Assign receiver if sender matches
                            else: "$sender" // Otherwise, assign sender
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // User collection
                    localField: "user",
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
                $lookup: {
                    from: "messages", // Messages collection
                    localField: "messages",
                    foreignField: "_id",
                    as: "messageDetails"
                }
            },
            {
                $addFields: {
                    unseenMessages: {
                        $size: {
                            $filter: {
                                input: "$messageDetails", // The array to filter
                                as: "message", // Alias for each element in the array
                                cond: {
                                    $and: [
                                        { $eq: ["$$message.receiver", new mongoose.Types.ObjectId(messageDetails?.receiver)] },
                                        { $eq: ["$$message.seen", false] }
                                    ]
                                } // Condition for filtering unseen messages
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$messageDetails", -1] } // Get the last message
                }
            },
            {
                $project: {
                    // sender: 1,
                    // receiver: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                    "userDetails._id": 1,
                    unseenMessages: 1,
                    lastMessage: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort conversations by creation date
            }
        ])
        io.to(messageDetails?.receiver).emit("receive-all-conversation", getAllConversationReceiver)
    })

    socket.on("seen", async (data) => {
        // console.log("seen data", data);
        // Update the seen status of a message
        await Message.updateMany({
            receiver: new mongoose.Types.ObjectId(data.seenUserId),
            sender: new mongoose.Types.ObjectId(data.chatUserId)
        }, {
            seen: true
        })

        // 
        // get conversation
        const conversation = await Conversation.findOne({
            $or: [
                {
                    sender: data.chatUserId,
                    receiver: data.seenUserId
                },
                {
                    sender: data.seenUserId,
                    receiver: data.chatUserId
                }
            ]
        }).populate("messages").sort({ updateAt: -1 })
        // console.log("conversation", conversation)


        io.to(data.chatUserId).to(data.seenUserId).emit("receive-chat-messages", conversation)

        const seenUserConversation = await Conversation.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(data.seenUserId) },
                        { receiver: new mongoose.Types.ObjectId(data.seenUserId) }
                    ]
                }
            },
            {
                $addFields: {
                    user: {
                        $cond: {
                            if: { $eq: ["$sender", new mongoose.Types.ObjectId(data.seenUserId)] }, // Check if sender matches
                            then: "$receiver", // Assign receiver if sender matches
                            else: "$sender" // Otherwise, assign sender
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users", // User collection
                    localField: "user",
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
                $lookup: {
                    from: "messages", // Messages collection
                    localField: "messages",
                    foreignField: "_id",
                    as: "messageDetails"
                }
            },
            {
                $addFields: {
                    // unseenMessages: 0
                    unseenMessages: {
                        $cond: {
                            if: {
                                $or: [
                                    { $eq: ["$sender", new mongoose.Types.ObjectId(data.chatUserId)] },
                                    { $eq: ["$receiver", new mongoose.Types.ObjectId(data.chatUserId)] },
                                ]
                            }, // Check if sender matches
                            then: 0, // Assign receiver if sender matches
                            else: {
                                $size: {
                                    $filter: {
                                        input: "$messageDetails", // The array to filter
                                        as: "message", // Alias for each element in the array
                                        cond: {
                                            $and: [
                                                { $eq: ["$$message.receiver", new mongoose.Types.ObjectId(data.seenUserId)] }, // Match sender ID
                                                { $eq: ["$$message.seen", false] } // Match unseen messages
                                            ]
                                        } // Condition for filtering unseen messages
                                    }
                                }
                            } // Otherwise, assign sender
                        }

                    }
                }
            },
            {
                $addFields: {
                    lastMessage: { $arrayElemAt: ["$messageDetails", -1] } // Get the last message
                }
            },
            {
                $project: {
                    // sender: 1,
                    // receiver: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                    "userDetails._id": 1,
                    unseenMessages: 1,
                    lastMessage: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { updatedAt: -1 } // Sort conversations by creation date
            }
        ])
        io.to(data.seenUserId).emit("receive-all-conversation", seenUserConversation)

        // const getAllConversationReceiver = await Conversation.aggregate([
        //     {
        //         $match: {
        //             $or: [
        //                 { sender: new mongoose.Types.ObjectId(messageDetails?.receiver) },
        //                 { receiver: new mongoose.Types.ObjectId(messageDetails?.receiver) }
        //             ]
        //         }
        //     },
        //     {
        //         $addFields: {
        //             user: {
        //                 $cond: {
        //                     if: { $eq: ["$sender", new mongoose.Types.ObjectId(messageDetails?.receiver)] }, // Check if sender matches
        //                     then: "$receiver", // Assign receiver if sender matches
        //                     else: "$sender" // Otherwise, assign sender
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "users", // User collection
        //             localField: "user",
        //             foreignField: "_id",
        //             as: "userDetails"
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "messages", // Messages collection
        //             localField: "messages",
        //             foreignField: "_id",
        //             as: "messageDetails"
        //         }
        //     },
        //     {
        //         $addFields: {
        //             unseenMessages: {
        //                 $size: {
        //                     $filter: {
        //                         input: "$messageDetails", // The array to filter
        //                         as: "message", // Alias for each element in the array
        //                         cond: {
        //                             $and: [
        //                                 { $eq: ["$$message.receiver", new mongoose.Types.ObjectId(messageDetails?.receiver)] },
        //                                 { $eq: ["$$message.seen", false] }
        //                             ]
        //                         } // Condition for filtering unseen messages
        //                     }
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $addFields: {
        //             lastMessage: { $arrayElemAt: ["$messageDetails", -1] } // Get the last message
        //         }
        //     },
        //     {
        //         $project: {
        //             // sender: 1,
        //             // receiver: 1,
        //             "userDetails.name": 1,
        //             "userDetails.email": 1,
        //             "userDetails.profilePic": 1,
        //             "userDetails._id": 1,
        //             unseenMessages: 1,
        //             lastMessage: 1,
        //             updatedAt: 1
        //         }
        //     },
        //     {
        //         $sort: { updatedAt: -1 } // Sort conversations by creation date
        //     }
        // ])
        // io.to(messageDetails?.receiver).emit("receive-all-conversation", getAllConversationReceiver)
    })

    socket.on("add_status", async (statusDetails) => {
        // console.log(statusDetails);
        const status = new Status(statusDetails)
        await status.save()

        io.to(statusDetails.user).emit("add_status", {
            success: true,
            message: "Status added successfully"
        })

        // const getStatus = await Status.find().populate("user", "name email profilePic ")
        // console.log("getStatus", getStatus);

        const groupedStatusData = await Status.aggregate([
            {
                $group: {
                    _id: "$user", // Group by user ID
                    user: { $first: "$user" }, // Include user details
                    files: {
                        $push: {
                            file: "$file", // Add the file details
                            message: "$message", // Add the corresponding message
                            message: "$message", // Add the corresponding message
                            createdAt: "$createdAt",
                            seen: "$seen"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Flatten the user details array
            },
            {
                $project: {
                    _id: 0,
                    files: 1,
                    count: 1,
                    "userDetails._id": 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                }
            },
            {
                $sort: { "files.0.createdAt": -1 }
            },
        ]);


        io.emit("get_status", groupedStatusData)

    })

    socket.on("get_status", async () => {

        const groupedStatusData = await Status.aggregate([
            {
                $group: {
                    _id: "$user", // Group by user ID
                    user: { $first: "$user" }, // Include user details
                    files: {
                        $push: {
                            _id: "$_id",
                            file: "$file", // Add the file details
                            message: "$message", // Add the corresponding message
                            createdAt: "$createdAt",
                            seen: "$seen"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Flatten the user details array
            },
            {
                $project: {
                    _id: 0,
                    files: 1,
                    count: 1,
                    "userDetails._id": 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    "userDetails.profilePic": 1,
                }
            },
            {
                $sort: { "files.0.createdAt": -1 }
            },
        ]);

        io.emit("get_status", groupedStatusData)
    })


    socket.on("initiate_call", (details) => {
        // console.log("initiate_call", details);
        io.to(details.to.id).emit("incomming_call", details)
    })

    socket.on("answer_call", (details) => {
        console.log("answer_call", details);
        io.to(details.from.id).emit("answer_call")
    })
    socket.on("decline_call", (details) => {
        // console.log("decline_call", details);
        io.to(details.from.id).emit("decline_call")
    })

    socket.on("call_end", (details) => {
        // console.log("call_end", details);
        io.to(details.from.id).to(details.to.id).emit("call_end")
    })


    // Save the user's peer ID
    socket.on('registerPeer', ({ userId, peerId }) => {
        users[userId] = { socketId: socket.id, peerId };
        console.log('Users:', users);
    });

    // Handle video call request
    socket.on('requestPeerId', (targetUserId, callback) => {
        if (users[targetUserId]) {
            const { peerId } = users[targetUserId];
            callback({ peerId });
        } else {
            callback({ error: 'User not available' });
        }
    });





    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id)
        // console.log("socket.handshake", socket.handshake);
        onlineUsers.delete(userDetails?._id)
        io.emit("onlineUsers", Array.from(onlineUsers))
        for (let userId in users) {
            if (users[userId].socketId === socket.id) {
                delete users[userId];
                break;
            }
        }
        console.log('User disconnected:', socket.id);
    })

});

export { app, server }


