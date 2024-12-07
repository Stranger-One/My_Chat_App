import React, { createContext, useState, useContext, useRef } from 'react';
const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
    const [peer, setPeer] = useState(null);
    const [myPeerId, setMyPeerId] = useState("");
    const [remotePeerId, setRemotePeerId] = useState("");
    const [stream, setStream] = useState(null);
    const [call, setCall] = useState(null);
  
    const myVideoRef = useRef();
    const remoteVideoRef = useRef();

    return (
        <MediaContext.Provider value={{ peer, setPeer, myPeerId, setMyPeerId, remotePeerId, setRemotePeerId, stream, setStream, call, setCall, myVideoRef, remoteVideoRef }}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => useContext(MediaContext);
