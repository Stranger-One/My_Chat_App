import React, { useCallback, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { SideBar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { setAllConversation, setOnlineUsers } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";
import { useMedia } from "../contexts/mediaProvider";
import Peer from "peerjs";

const HomeLayout = () => {
  const userData = useSelector((state) => state.global.userData);
  const dispatch = useDispatch();
  const socket = useSocket();
  const {
    peer,
    setPeer,
    myPeerId,
    setMyPeerId,
    remotePeerId,
    setRemotePeerId,
    stream,
    setStream,
    call,
    setCall,
    myVideoRef,
    remoteVideoRef,
  } = useMedia();
  // console.log(socket);

  const handleOnlineUsers = useCallback(
    (data) => {
      console.log("onlineUsers", data);
      dispatch(setOnlineUsers(data));
    },
    [socket]
  );

  const handleReceiveConversations = useCallback(
    (data) => {
      console.log("all-chats", data);
      dispatch(setAllConversation(data));
    },
    [socket]
  );

  useEffect(() => {
    if (userData && socket) {
      // Initialize PeerJS
      const newPeer = new Peer();
      setPeer(newPeer);

      newPeer.on("open", (id) => {
        setMyPeerId(id);
        socket.emit("registerPeer", { userId: userData._id, peerId: id }); // Replace "user1" with dynamic user ID
      });

      newPeer.on("call", (incomingCall) => {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setStream(stream);
            myVideoRef.current.srcObject = stream
            incomingCall.answer(stream);

            incomingCall.on("stream", (remoteStream) => {
              remoteVideoRef.current.srcObject = remoteStream;
            });
          });
      });

      return () => newPeer.destroy();
    }
  }, [socket, userData]);

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
