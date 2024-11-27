import axios from "axios";
const axiosInstant = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
})


export const registerUser = async (data) => {
    try {
        const response = await axiosInstant.post("/register", data)
        return response.data
    } catch (error) {
        console.error("Failed to register user: ", error.response.data);
        return error.response.data
    }
};

export const loginUser = async (data) => {
    try {
        const response = await axiosInstant.post("/login", data)
        // console.log(response);
        return response.data
    } catch (error) {
        console.error("Failed to register user: ", error.response);
        return error.response
    }
};

export const searchUsers = async (query) => {
    try {
        const response = await axiosInstant.get("/search-users", {
            params: {
                query: query
            }
        })
        return response.data

    } catch (error) {
        console.error("Failed search users: ", error.response.data);
        return error.response.data

    }
};

export const getUser = async (id) => {
    try {
        const response = await axiosInstant.get("/get-user", {
            params: {
                id
            }
        })
        return response.data

    } catch (error) {
        console.error("Failed get users: ", error.response.data);
        return error.response.data

    }
};

export const checkAuthentication = async (token) => {
    try {
        const response = await axiosInstant.get("/check-auth", {
            // withCredentials: true,
            params: {
                token
            }
        })

        // console.log(response.data);
        return response.data

    } catch (error) {
        // console.error(error);
        return error.response
    }
};

export const sendVerification = async (email) => {
    try {

        const response = await axiosInstant.post("/send-verification", {
            email
        })
        return response.data

    } catch (error) {
        // console.error(error);
        return error.response.data
    }
};

export const verifyAccount = async (data) => {
    try {

        const response = await axiosInstant.post("/verify", data)
        return response.data

    } catch (error) {
        // console.error(error);
        return error.response.data
    }
};

export const updateUser = async (data) => {
    try {
        const response = await axiosInstant.post("/update-user", data)
        return response.data
    } catch (error) {
        console.error("Failed to register user: ", error.response.data);
        return error.response.data
    }
};


