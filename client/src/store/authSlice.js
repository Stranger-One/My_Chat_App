import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        userData: null,
        isAuthenticated: false,
        loading: true,
        onlineUsers: null,
        // socketConnection: null,
        allConversation: [],
        currentChatId: null,
        allUserStatus: [],
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        // setSocketConnection: (state, action) => {
        //     state.socketConnection = action.payload;
        // },
        setAllConversation: (state, action)=>{
            state.allConversation = action.payload;
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        }  ,
        setAllUserStatus: (state, action) =>{
            state.allUserStatus = action.payload;
        }

    }
})

export const { setUserData, setIsAuthenticated, setLoading, setOnlineUsers, setAllConversation, setCurrentChatId, setAllUserStatus } = authSlice.actions;
export default authSlice.reducer;