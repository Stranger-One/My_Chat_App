import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineFullscreenExit, AiOutlineFullscreen } from "react-icons/ai";
import { IoCall, IoVideocam } from "react-icons/io5";
import {
  setCallAccepted,
  setCallActive,
  setCallDetails,
  setCallIncomming,
  setCallLogs,
  setCallStatus,
} from "../store/globalSlice";
import { CallPageFooter } from "../components";
import { useMedia } from "../contexts/mediaProvider";
import { useSocket } from "../contexts/SocketProvider";
import { addCall, getCallLog } from "../services/callServices";

const CallPageLayout = () => {
  const userData = useSelector((state) => state.global.userData);
  const callActive = useSelector((state) => state.global.callActive);
  const callStatus = useSelector((state) => state.global.callStatus);
  const callIncomming = useSelector((state) => state.global.callIncomming);
  const callDetails = useSelector((state) => state.global.callDetails);
  const callAccepted = useSelector((state) => state.global.callAccepted);
  const callType = useSelector((state) => state.global.callType);
  const [isMinimized, setIsMinimized] = useState(false);
  const dispatch = useDispatch();

  const socket = useSocket();
  const {
    peer,
    setStream,
    myVideoRef,
    remoteVideoRef,
    duration,
    startTimer,
    stopTimer,
    playRingtone,
    stopRingtone,
  } = useMedia();
  const [incomingPeerCall, setIncomingPeerCall] = useState(null);

  const fetchCallLogs = useCallback(async () => {
    if (!userData?._id) return;
    try {
      const callLogs = await getCallLog(userData._id);
      if (callLogs?.data) {
        dispatch(setCallLogs(callLogs.data));
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
    }
  }, [userData?._id, dispatch]);

  const handleIncommingCall = useCallback(
    (details) => {
      dispatch(setCallIncomming(true));
      dispatch(setCallDetails(details));
      playRingtone("incoming");
    },
    [dispatch, playRingtone]
  );

  const declineIncommingCall = () => {
    stopRingtone();
    if (socket && callDetails) {
      socket.emit("decline_call", callDetails);
      dispatch(setCallDetails(null));
      dispatch(setCallIncomming(false));
      dispatch(setCallStatus("Call declined"));
    }
  };

  const handleDeclineCall = useCallback(async () => {
    stopRingtone();
    stopTimer();
    dispatch(setCallStatus("Call declined"));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    dispatch(setCallActive(false));
    dispatch(setCallDetails(null));
    setStream(null);
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [dispatch, stopRingtone, stopTimer, setStream, myVideoRef, remoteVideoRef]);

  const answerIncommingCall = async () => {
    stopRingtone();
    if (socket && incomingPeerCall) {
      dispatch(setCallIncomming(false));
      dispatch(setCallAccepted(true));
      dispatch(setCallActive(true));

      const isVoice = callDetails?.callType === "voice";
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !isVoice,
          audio: true,
        });
        setStream(stream);

        if (myVideoRef.current && !isVoice) {
          myVideoRef.current.srcObject = stream;
        }

        incomingPeerCall.answer(stream);
        incomingPeerCall.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        dispatch(setCallStatus("Connected"));
        startTimer();
      } catch (error) {
        console.error("Error answering call:", error);
      }
    }
  };

  const handleAnswerCall = useCallback(() => {
    stopRingtone();
    dispatch(setCallIncomming(false));
    dispatch(setCallActive(true));
    dispatch(setCallAccepted(true));
    dispatch(setCallStatus("Connected"));
    startTimer();
  }, [dispatch, stopRingtone, startTimer]);

  const endCall = async () => {
    stopRingtone();
    stopTimer();
    if (socket && callDetails) {
      socket.emit("call_end", callDetails);
      const logData = {
        duration,
        callerId: callDetails.from?.id,
        receiverId: callDetails.to?.id,
        startTime: `${callDetails.callDate} ${callDetails.callTime}`,
        callType: callDetails.callType || "video",
        status: duration > 0 ? "answered" : "missed",
      };
      try {
        await addCall(logData);
      } catch (error) {
        console.error("Error adding call log:", error);
      }
    }
  };

  const handleEndCall = useCallback(async () => {
    stopRingtone();
    stopTimer();
    dispatch(setCallStatus("Call ended"));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    dispatch(setCallActive(false));
    dispatch(setCallAccepted(false));
    dispatch(setCallDetails(null));
    setStream(null);
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    fetchCallLogs();
  }, [dispatch, stopRingtone, stopTimer, setStream, myVideoRef, remoteVideoRef, fetchCallLogs]);

  useEffect(() => {
    if (userData?._id) {
      fetchCallLogs();
    }
  }, [userData?._id, fetchCallLogs]);

  useEffect(() => {
    if (peer) {
      peer.on("call", (incomingCall) => {
        setIncomingPeerCall(incomingCall);
        const details = incomingCall?.metadata?.callDetails;
        if (details) {
          handleIncommingCall(details);
        }
      });
    }
  }, [peer, handleIncommingCall]);

  useEffect(() => {
    if (socket) {
      socket.on("incomming_call", handleIncommingCall);
      socket.on("decline_call", handleDeclineCall);
      socket.on("answer_call", handleAnswerCall);
      socket.on("call_end", handleEndCall);

      return () => {
        socket.off("incomming_call", handleIncommingCall);
        socket.off("decline_call", handleDeclineCall);
        socket.off("answer_call", handleAnswerCall);
        socket.off("call_end", handleEndCall);
      };
    }
  }, [socket, handleIncommingCall, handleDeclineCall, handleAnswerCall, handleEndCall]);

  const targetContact =
    callDetails?.from?.id === userData?._id ? callDetails?.to : callDetails?.from;
  const isVoiceOnly = (callDetails?.callType || callType) === "voice";

  return callIncomming || callActive ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
      {/* Active Call Window */}
      {callActive && (
        <div
          className={`${
            isMinimized
              ? "w-[300px] h-[220px] fixed bottom-4 right-4"
              : "w-full max-w-[680px] h-[80vh] max-h-[580px]"
          } bg-wa-panel-dark text-white rounded-2xl shadow-wa-modal flex flex-col overflow-hidden pointer-events-auto border border-white/10 transition-all select-none`}
        >
          {/* Header */}
          <div className="h-12 px-4 flex justify-between items-center bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2">
              {isVoiceOnly ? (
                <IoCall className="text-wa-teal" size={17} />
              ) : (
                <IoVideocam className="text-wa-teal" size={19} />
              )}
              <span className="text-sm font-semibold capitalize">
                WhatsApp {isVoiceOnly ? "Voice Call" : "Video Call"}
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              {isMinimized ? <AiOutlineFullscreen size={18} /> : <AiOutlineFullscreenExit size={18} />}
            </button>
          </div>

          {/* Call Body */}
          <div className="flex-1 relative bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
            {isVoiceOnly || isMinimized ? (
              // Voice Call Screen
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-wa-teal shadow-xl">
                    <img
                      src={targetContact?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                      alt={targetContact?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {callStatus === "Connected" && (
                    <span className="absolute -inset-2 rounded-full border-2 border-wa-teal/40 animate-ping pointer-events-none"></span>
                  )}
                </div>
                <h3 className="text-xl font-bold capitalize mb-1">{targetContact?.name || "Contact"}</h3>
                <p className="text-sm text-wa-teal font-mono">
                  {callStatus === "Connected"
                    ? `${Math.floor(duration / 60).toString().padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`
                    : callStatus}
                </p>
                {/* Hidden audio element for remote stream */}
                <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              </div>
            ) : (
              // Video Call Screen
              <div className="w-full h-full relative">
                {/* Remote Stream Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video PiP */}
                <div
                  className={`absolute z-10 bottom-3 right-3 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all ${
                    callAccepted ? "w-36 h-24" : "inset-0 w-full h-full"
                  }`}
                >
                  <video
                    ref={myVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Contact Name & Timer */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <span className="font-semibold capitalize">{targetContact?.name}</span>
                  <span className="text-wa-teal font-mono">
                    {callStatus === "Connected"
                      ? `${Math.floor(duration / 60).toString().padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`
                      : callStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <CallPageFooter endCall={endCall} isVoiceOnly={isVoiceOnly} />
        </div>
      )}

      {/* Incoming Call Dialog */}
      {callIncomming && (
        <div className="w-[340px] bg-wa-panel-dark text-white rounded-2xl shadow-wa-modal border border-white/10 p-6 flex flex-col items-center pointer-events-auto animate-bounce-once select-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-wa-teal mb-3">
            Incoming WhatsApp {callDetails?.callType === "voice" ? "Voice" : "Video"} Call
          </span>

          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-wa-teal mb-3 shadow-lg">
            <img
              src={callDetails?.from?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
              alt={callDetails?.from?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-lg font-bold capitalize mb-6">{callDetails?.from?.name || "Caller"}</h3>

          <div className="w-full flex items-center justify-around gap-4">
            <button
              onClick={declineIncommingCall}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <IoCall className="rotate-[135deg]" size={18} />
              Decline
            </button>
            <button
              onClick={answerIncommingCall}
              className="flex-1 py-2.5 px-4 rounded-xl bg-wa-teal hover:bg-wa-teal-hover text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <IoCall size={18} />
              Answer
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default CallPageLayout;
