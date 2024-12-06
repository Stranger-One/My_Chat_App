import { createSlice } from "@reduxjs/toolkit";

const globalSlice = createSlice({
    name: "auth",
    initialState: {
        userData: null,
        isAuthenticated: false,
        loading: true,
        onlineUsers: [],
        allConversation: [],
        allUserStatus: [],
        
        callDetails: null,
        callIncomming: false,
        callAccepted: false,
        callActive: false,
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
        setAllUserStatus: (state, action) => {
            state.allUserStatus = action.payload;
        },
        logout: (state, action)=>{
            state.userData = null
            state.isAuthenticated=false
            state.onlineUsers=[]
            state.allConversation=[]
            sessionStorage.removeItem("token");
        },

        setCallDetails: (state, action)=>{
            state.callDetails = action.payload
        },
        setCallIncomming: (state, action)=>{
            state.callIncomming = action.payload
        },
        setCallAccepted: (state, action)=>{
            state.callAccepted = action.payload
        },
        setCallActive: (state, action)=>{
            state.callActive = action.payload
        },
       
    }
})

export const { setUserData, setIsAuthenticated, setLoading, setOnlineUsers, setAllConversation, setAllUserStatus, setCallIncomming, setCallDetails, logout, setCallAccepted, setCallActive  } = globalSlice.actions;

export default globalSlice.reducer;