import React, { createContext, useState, useContext, useRef } from "react";
const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [stream, setStream] = useState(null);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);
  const startTimer = () => {
    setDuration(0);
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    // setDuration(0);
  };

  return (
    <MediaContext.Provider
      value={{
        peer,
        setPeer,
        myPeerId,
        setMyPeerId,
        remotePeerId,
        setRemotePeerId,
        stream,
        setStream,
        myVideoRef,
        remoteVideoRef,
        duration,
        startTimer,
        stopTimer
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
