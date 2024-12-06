import React, { useCallback, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { SideBar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllConversation,
  setOnlineUsers,
} from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";

const HomeLayout = () => {
  const userData = useSelector((state) => state.global.userData);
  const dispatch = useDispatch();
  const socket = useSocket();
  // console.log(socket);

  const handleOnlineUsers = useCallback((data) => {
    console.log("onlineUsers", data);
    dispatch(setOnlineUsers(data));
  }, [socket]);

  const handleReceiveConversations = useCallback((data) => {
    console.log("all-chats", data);
    dispatch(setAllConversation(data));
  }, [socket]);

  useEffect(() => {
    if (socket) {
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
    }
  }, [userData, socket]);

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
