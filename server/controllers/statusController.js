import Status from "../models/StatusModel.js";

export const addStatus = async (req, res) => {
    try {
        const { userId, file, message } = req.body;

        const status = new Status({
            user: userId,
            file: file,
            message
        })

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            })
        }
        await status.save()
        res.status(201).json({
            success: true,
            message: "Status added successfully",
            data: status
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Status add failed!",
            error
        })
    }
};

export const getAllStatus = async (req, res) => {
    try {

        const groupedData = await Status.aggregate([
            {
                $group: {
                    _id: "$user", // Group by user ID
                    user: { $first: "$user" }, // Include user details
                    files: {
                        $push: {
                            file: "$file", // Add the file details
                            message: "$message" // Add the corresponding message
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
            }
        ]);

        if (!groupedData) {
            return res.status(404).json({
                success: false,
                message: "No status found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Status found successfully",
            data: groupedData
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "failed to get status",
            error
        })
    }
};