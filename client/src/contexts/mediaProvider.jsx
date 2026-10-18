import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from "react";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callType, setCallType] = useState("video"); // "voice" | "video"

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    setDuration(0);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  // Web Audio WhatsApp-style synthesized ringtone (100% reliable)
  const playRingtone = useCallback((type = "incoming") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const playTone = () => {
        try {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "sine";
          osc2.type = "sine";

          if (type === "incoming") {
            osc1.frequency.setValueAtTime(440, ctx.currentTime);
            osc2.frequency.setValueAtTime(480, ctx.currentTime);
          } else {
            // Outgoing ringing tone
            osc1.frequency.setValueAtTime(425, ctx.currentTime);
            osc2.frequency.setValueAtTime(450, ctx.currentTime);
          }

          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 1.2);
          osc2.stop(ctx.currentTime + 1.2);
        } catch (e) {
          console.warn("Audio synth warning:", e);
        }
      };

      playTone();
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = setInterval(playTone, 2500);
    } catch (e) {
      console.warn("Ringtone error:", e);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    clearInterval(ringtoneIntervalRef.current);
  }, []);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, [stream]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      if (myVideoRef.current && stream) {
        myVideoRef.current.srcObject = stream;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const scStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(scStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = scStream;
        }
        setIsScreenSharing(true);
        scStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (myVideoRef.current && stream) {
            myVideoRef.current.srcObject = stream;
          }
        };
      } catch (err) {
        console.warn("Screen share cancelled or error:", err);
      }
    }
  }, [isScreenSharing, screenStream, stream]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(ringtoneIntervalRef.current);
    };
  }, []);

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
        stopTimer,
        playRingtone,
        stopRingtone,
        isAudioMuted,
        isVideoMuted,
        toggleAudio,
        toggleVideo,
        isScreenSharing,
        toggleScreenShare,
        callType,
        setCallType,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
