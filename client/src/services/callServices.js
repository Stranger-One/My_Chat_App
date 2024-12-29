import axios from "axios";
const axiosInstant = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/call`,
})


export const addCall = async (data) => {
    try {
        const response = await axiosInstant.post("/add", data)
        return response.data
        // console.log(response);
        
    } catch (error) {
        console.error(error);
        return null
    }
};

export const getCallLog = async (userId) => {
    try {
        const response = await axiosInstant.get("/get", {
            params: {
                userId
            }
        })
        return response.data
        
    } catch (error) {
        console.error(error);
        return null
    }
};