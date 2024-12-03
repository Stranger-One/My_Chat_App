import axios from "axios";

const uploadToCloudinary = async (file) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
            file
        );
        if(!response){
            return null;
        }

        return response.data.file

    } catch (error) {
        console.error(error);
        return null;
    }
};

export default uploadToCloudinary;