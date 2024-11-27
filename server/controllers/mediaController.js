export const uploadMedia = async (req, res) => {
    try {
        const file = req.file;

        // console.log("body routes file", file);
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            file: file
        })
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "File uploading failed",
            error,
        })
    }
};