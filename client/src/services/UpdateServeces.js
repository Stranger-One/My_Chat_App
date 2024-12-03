import axios from "axios";
const axiosInstant = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/status`,
})

export const addStatus = async (data) => {
    try {
        const response = await axiosInstant.post("/add", data)
        return response.data

    } catch (error) {
        console.error(error);
        

    }
};

export const getAllStatus = async () => {
    try {
        const response = await axiosInstant.get("/get")
        return response.data

    } catch (error) {
        console.error(error);
    }
};