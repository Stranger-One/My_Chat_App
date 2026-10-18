import React, { useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
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
  const { setPeer, setMyPeerId } = useMedia();
  const peerInstanceRef = useRef(null);

  const handleOnlineUsers = useCallback(
    (data) => {
      dispatch(setOnlineUsers(data));
    },
    [dispatch]
  );

  const handleReceiveConversations = useCallback(
    (data) => {
      dispatch(setAllConversation(data));
    },
    [dispatch]
  );

  // Initialize PeerJS once with Google STUN servers
  useEffect(() => {
    if (userData && socket && !peerInstanceRef.current) {
      try {
        const newPeer = new Peer(undefined, {
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });

        peerInstanceRef.current = newPeer;
        setPeer(newPeer);

        newPeer.on("open", (id) => {
          setMyPeerId(id);
          socket.emit("registerPeer", { userId: userData._id, peerId: id });
        });

        newPeer.on("error", (err) => {
          console.warn("PeerJS connection note:", err);
        });
      } catch (e) {
        console.error("Failed to initialize PeerJS:", e);
      }
    }

    return () => {
      if (peerInstanceRef.current) {
        peerInstanceRef.current.destroy();
        peerInstanceRef.current = null;
        setPeer(null);
      }
    };
  }, [socket, userData?._id, setPeer, setMyPeerId]);

  useEffect(() => {
    if (socket) {
      socket.on("onlineUsers", handleOnlineUsers);

      if (userData?._id) {
        socket.emit("request-all-conversation", userData._id);
        socket.on("receive-all-conversation", handleReceiveConversations);
      }

      return () => {
        socket.off("onlineUsers", handleOnlineUsers);
        socket.off("receive-all-conversation", handleReceiveConversations);
      };
    }
  }, [userData?._id, socket, handleOnlineUsers, handleReceiveConversations]);

  return (
    <div className="w-full h-screen flex flex-col-reverse md:flex-row bg-wa-bg-light dark:bg-wa-bg-dark text-wa-text-primary-light dark:text-wa-text-primary-dark overflow-hidden">
      <SideBar />

      <div className="w-full h-full flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
