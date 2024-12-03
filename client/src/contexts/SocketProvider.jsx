import { createContext, useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  const userData = useSelector((state) => state.auth.userData);

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          token: token,
        },
      }),
    [userData]
  );

  // useEffect(() => {
  //   if (userData) {
  //     io(import.meta.env.VITE_BACKEND_URL, {
  //       auth: {
  //         token: token,
  //       },
  //     });
  //   }
  // }, [userData]);

  return (
    <SocketContext.Provider value={socket ? socket : null}>
      {props.children}
    </SocketContext.Provider>
  );
};
