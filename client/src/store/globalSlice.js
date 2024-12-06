import { createSlice } from "@reduxjs/toolkit";

const globalSlice = createSlice({
    name: "auth",
    initialState: {
        userData: null,
        isAuthenticated: false,
        loading: true,
        onlineUsers: [],
        allConversation: [],
        currentChatId: null,
        allUserStatus: [],

        callActive: false,
        callIncomming: false,
        callDetails: null
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
        setAllConversation: (state, action) => {
            state.allConversation = action.payload;
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },
        setAllUserStatus: (state, action) => {
            state.allUserStatus = action.payload;
        },
        setCallIncomming: (state, action)=>{
            state.callIncomming = action.payload
        },
        setCallActive: (state, action)=>{
            state.callActive = action.payload
        },
        setCallDetails: (state, action)=>{
            state.callDetails = action.payload
        },
        logout: (state, action)=>{
            state.userData = null
            state.isAuthenticated=false
            state.onlineUsers=[]
            state.allConversation=[]
            sessionStorage.removeItem("token");
        }
    }
})

export const { setUserData, setIsAuthenticated, setLoading, setOnlineUsers, setAllConversation, setCurrentChatId, setAllUserStatus, setCallIncomming, setCallDetails, logout, setCallActive  } = globalSlice.actions;
export default globalSlice.reducer;