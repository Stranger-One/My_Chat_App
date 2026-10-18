import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setOnlineUsers, setTypingUser } from "../store/globalSlice";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  const userData = useSelector((state) => state.global.userData); 
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const dispatch = useDispatch();

  const socket = useMemo(() => {
    if (userData && token) {
      const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          token,
        },
      });

      socketInstance.on("connect", () => {
        setIsSocketConnected(true);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketInstance.on("disconnect", () => {
        setIsSocketConnected(false);
      });

      return socketInstance;
    }
    return null;
  }, [userData?._id, token]);

  useEffect(() => {
    if (socket) {
      socket.on("onlineUsers", (data) => {
        dispatch(setOnlineUsers(data));
      });

      const handleTyping = ({ senderId }) => {
        dispatch(setTypingUser({ userId: senderId, isTyping: true }));
      };

      const handleStopTyping = ({ senderId }) => {
        dispatch(setTypingUser({ userId: senderId, isTyping: false }));
      };

      socket.on("typing", handleTyping);
      socket.on("user-typing", handleTyping);
      socket.on("stop-typing", handleStopTyping);
      socket.on("user-stop-typing", handleStopTyping);

      return () => {
        socket.off("onlineUsers");
        socket.off("typing", handleTyping);
        socket.off("user-typing", handleTyping);
        socket.off("stop-typing", handleStopTyping);
        socket.off("user-stop-typing", handleStopTyping);
        socket.disconnect();
      };
    }
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={isSocketConnected ? socket : null}>
      {props.children}
    </SocketContext.Provider>
  );
};
