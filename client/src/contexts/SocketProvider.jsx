import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setOnlineUsers } from "../store/globalSlice";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const token = JSON.parse(sessionStorage.getItem("token")); // Retrieve token from sessionStorage
  const userData = useSelector((state) => state.global.userData); // Get user data from Redux
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
        // console.log("Socket connected successfully!");
      });

      // socketInstance.on("onlineUsers", (data) => {
      //     console.log("onlineUsers", data);
      //     dispatch(setOnlineUsers(data));
      //   });

      socketInstance.on("disconnect", () => {
        setIsSocketConnected(false);
        // console.log("Socket disconnected.");
      });

      return socketInstance;
    }
    return null;
  }, [userData, token]); // Regenerate socket when token changes

  useEffect(() => {
    if (socket) {
      // Disconnect socket on token removal (logout) or unmount
      socket.on("onlineUsers", (data) => {
        // console.log("onlineUsers", data);
        dispatch(setOnlineUsers(data));
      });

      return () => {
        socket.off("onlineUsers");

        socket.disconnect();
        // console.log("Socket disconnected on logout.");
      };
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={isSocketConnected ? socket : null}>
      {props.children}
    </SocketContext.Provider>
  );
};

// socketInstance.on("onlineUsers", (data) => {
//   console.log("onlineUsers", data);
// });
