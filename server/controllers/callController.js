import Call from "../models/callModel.js";

export const addCall = async (req, res) => {
    try {
        const { callerId, receiverId, startTime, endTime, duration, status } = req.body;
        const call = new Call({
            callerId,
            receiverId,
            startTime,
            endTime,
            duration,
            status
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