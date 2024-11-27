import React, { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { ChatSection, SideBar } from "../components";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllConversation,
  setCurrentChatId,
  setOnlineUsers,
  setSocketConnection,
} from "../store/authSlice";

const HomeLayout = () => {
  const params = useParams();

  const dispatch = useDispatch();
  const token = JSON.parse(sessionStorage.getItem("token"));
  const userData = useSelector((state) => state.auth.userData);

  // socket connection
  useEffect(() => {
    if (userData) {
      const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          token: token,
        },
      });

      socketConnection.emit("request-all-conversation", userData?._id);

      socketConnection.on("receive-all-conversation", (data) => {
        // console.log("all-chats", data);
        dispatch(setAllConversation(data));
      });

      // get onlineUsers from server side
      socketConnection.on("onlineUsers", (data) => {
        // console.log("onlineUsers", data);
        dispatch(setOnlineUsers(data));
      });

      dispatch(setSocketConnection(socketConnection));

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [userData]);

  useEffect(()=>{
    if(params.userId){
      dispatch(setCurrentChatId(params.userId))
    } else {
      dispatch(setCurrentChatId(null))
    }
    
    // console.log(params.userId);
  }, [params.userId])


  return (
    <div className="w-full h-screen grid grid-rows-[auto_50px] md:grid-cols-[50px_auto]">
      <SideBar />

      <div className="w-full h-full rounded-md overflow-hidden order-first md:-order-none" >
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
