import { createSlice } from "@reduxjs/toolkit";

const initialTheme = localStorage.getItem("wa_theme") || "dark";
if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}

const globalSlice = createSlice({
    name: "global",
    initialState: {
        userData: null,
        isAuthenticated: false,
        loading: true,
        theme: initialTheme,
        onlineUsers: [],
        allConversation: [],
        allUserStatus: [],
        typingUsers: {}, // { [userId]: boolean }
        
        // Voice / Video Calling state
        callStatus: "idle", // idle, outgoing, ringing, connected, ended
        callType: "video", // "voice" | "video"
        callDetails: null,
        callIncomming: false,
        callAccepted: false,
        callActive: false,
        callLogs: [],

        // Message reply & media preview state
        replyingToMessage: null,
        lightboxMedia: null, // { url, type, name }
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
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem("wa_theme", action.payload);
            if (action.payload === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        },
        toggleTheme: (state) => {
            const nextTheme = state.theme === "dark" ? "light" : "dark";
            state.theme = nextTheme;
            localStorage.setItem("wa_theme", nextTheme);
            if (nextTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
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
        setTypingUser: (state, action) => {
            const { userId, isTyping } = action.payload;
            if (isTyping) {
                state.typingUsers[userId] = true;
            } else {
                delete state.typingUsers[userId];
            }
        },
        setReplyingToMessage: (state, action) => {
            state.replyingToMessage = action.payload;
        },
        setLightboxMedia: (state, action) => {
            state.lightboxMedia = action.payload;
        },
        logout: (state) => {
            state.userData = null;
            state.isAuthenticated = false;
            state.onlineUsers = [];
            state.allConversation = [];
            state.callActive = false;
            state.callIncomming = false;
            state.callDetails = null;
            sessionStorage.removeItem("token");
        },

        // Call actions
        setCallDetails: (state, action) => {
            state.callDetails = action.payload;
        },
        setCallType: (state, action) => {
            state.callType = action.payload;
        },
        setCallIncomming: (state, action) => {
            state.callIncomming = action.payload;
        },
        setCallAccepted: (state, action) => {
            state.callAccepted = action.payload;
        },
        setCallActive: (state, action) => {
            state.callActive = action.payload;
        },
        setCallStatus: (state, action) => {
            state.callStatus = action.payload;
        },
        setCallLogs: (state, action) => {
            state.callLogs = action.payload;
        }
    }
});

export const { 
    setUserData, 
    setIsAuthenticated, 
    setLoading, 
    setTheme,
    toggleTheme,
    setOnlineUsers, 
    setAllConversation, 
    setAllUserStatus, 
    setTypingUser,
    setReplyingToMessage,
    setLightboxMedia,
    setCallIncomming, 
    setCallDetails, 
    setCallType,
    logout, 
    setCallAccepted, 
    setCallActive, 
    setCallStatus, 
    setCallLogs 
} = globalSlice.actions;

export default globalSlice.reducer;