import axios from "axios";
const axiosInstant = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/message`,
})


export const getConversation = async (sender, receiver) => {
    try {
        const response = await axiosInstant.get("/get-conversation", {
            params: {
                sender: sender,
                receiver: receiver
            }
        })
        return response.data

    } catch (error) {
        console.error(error);
        

    }
};

export const getAllConversation = async (sender) => {
    try {
        const response = await axiosInstant.get("/get-all-conversation", {
            params: {
                sender: sender
            }
        })
        return response.data

    } catch (error) {
        console.error(error);


    }
};

export const findConversation = async (query, userId) => {
    try {
        const response = await axiosInstant.get("/find-conversation", {
            params: {
                query: query,
                userId: userId
            }
        })
        return response.data

    } catch (error) {
        console.error(error);


    }
};

export const deleteConversation = async (conversationsId) => {
    try {
        const response = await axiosInstant.delete(`/delete-conversation/${conversationsId}`)
        return response.data

    } catch (error) {
        console.error(error);
        return error
    }
};

