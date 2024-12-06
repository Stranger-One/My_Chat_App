import React, { createContext, useState, useContext, useRef } from 'react';
const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
    const [stream, setStream] = useState(null);
    const localStreamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const connectionRef = useRef(null)

    return (
        <MediaContext.Provider value={{ stream, setStream, localStreamRef, remoteStreamRef, connectionRef }}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => useContext(MediaContext);
