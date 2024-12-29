import Call from "../models/callModel.js";

export const addCall = async (req, res) => {
    try {
        const { callerId, receiverId, startTime, duration } = req.body;
        const call = new Call({
            callerId,
            receiverId,
            startTime,
            duration
        });

        await call.save();
        res.status(201).json({ 
            success: true,
            message: "Call added successfully!",
            data: call 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Call added failed!",
            data: null
        });
        
    }
};

export const getCallLog = async (req, res) => {
    try {
        const userId = req.query.userId;
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "User id is required!",
                data: null
            });
        }
        const callLogs = await Call.find({ $or: [{ callerId: userId }, { receiverId: userId }] })
            .populate('callerId', 'name email profilePic')
            .populate('receiverId', 'name email profilePic')
            .sort({ createdAt: -1 });
        
        if(!callLogs){
            return res.status(404).json({
                success: false,
                message: "Call logs not found!",
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Call logs fetched successfully!",
            data: callLogs
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Call logs fetch failed!",
            data: null
        });
        
    }
};