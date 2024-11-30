import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const token = JSON.parse(sessionStorage.getItem("token"));

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          token: token,
        },
      }),
    []
  );
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
