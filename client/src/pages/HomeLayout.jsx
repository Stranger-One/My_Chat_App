import React, { useCallback, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { ChatSection, SideBar } from "../components";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllConversation,
  setCurrentChatId,
  setOnlineUsers,
} from "../store/authSlice";
import { useSocket } from "../contexts/SocketProvider";

const HomeLayout = () => {
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const params = useParams();
  const socket = useSocket();
  // console.log(socket);

  const handleOnlineUsers = useCallback((data) => {
    console.log("onlineUsers", data);
    dispatch(setOnlineUsers(data));
  }, []);

  const handleReceiveConversations = useCallback((data) => {
    console.log("all-chats", data);
    dispatch(setAllConversation(data));
  }, []);

  useEffect(() => {
    socket.on("onlineUsers", handleOnlineUsers);

    if (userData) {
      socket.emit("request-all-conversation", userData?._id);
      socket.on("receive-all-conversation", handleReceiveConversations);
    }

    return () => {
      socket.off("receive-all-conversation");
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("receive-all-conversation", handleReceiveConversations);
    };
  }, [userData, socket]);

  useEffect(() => {
    if (params.userId) {
      dispatch(setCurrentChatId(params.userId));
    } else {
      dispatch(setCurrentChatId(null));
    }
  }, [params.userId]);

  return (
    <div className="w-full h-screen grid grid-rows-[auto_50px] md:grid-cols-[50px_auto]">
      <SideBar />

      <div className="w-full h-full rounded-md overflow-hidden order-first md:-order-none">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
