import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineFullscreenExit } from "react-icons/ai";
import { AiOutlineFullscreen } from "react-icons/ai";
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
import Peer from "peerjs";
import { addCall, getCallLog } from "../services/callServices";

const CallPageLayout = () => {
  const userData = useSelector((state) => state.global.userData);
  const callActive = useSelector((state) => state.global.callActive);
  const callStatus = useSelector((state) => state.global.callStatus);
  const callIncomming = useSelector((state) => state.global.callIncomming);
  const callDetails = useSelector((state) => state.global.callDetails);
  const callAccepted = useSelector((state) => state.global.callAccepted);
  const [isMinimized, setIsMinimized] = useState(false);
  const dispatch = useDispatch();
  const [duration, setDuration] = useState(0);
  const socket = useSocket();
  const intervalRef = useRef(null);
  const {
    peer,
    setPeer,
    myPeerId,
    setMyPeerId,
    remotePeerId,
    setRemotePeerId,
    stream,
    setStream,
    call,
    setCall,
    myVideoRef,
    remoteVideoRef,
  } = useMedia();

  useEffect(() => {
    console.log("duration :: ", duration);
  }, [duration]);

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

  const fetchCallLogs = async () => {
    const callLogs = await getCallLog(userData._id);
    // console.log("call log response", callLogs);
    dispatch(setCallLogs(callLogs.data));
  };

  const handleIncommingCall = useCallback((callDetails) => {
    console.log("incomming call...", callDetails);
    dispatch(setCallIncomming(true));
    dispatch(setCallDetails(callDetails));
  }, []);

  const declineIncommingCall = () => {
    if (socket) {
      console.log("call declined");
      socket.emit("decline_call", callDetails);
      dispatch(setCallDetails(null));
      dispatch(setCallIncomming(false));
      dispatch(setCallStatus("End call"));
    }
  };

  const handleDeclineCall = useCallback(async () => {
    console.log("call declined");
    dispatch(setCallStatus("End call"));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dispatch(setCallActive(false));
    dispatch(setCallDetails(null));
  }, []);

  const answerIncommingCall = () => {
    if (socket) {
      console.log("call answered :: userData.id :: ", userData);
      dispatch(setCallIncomming(false));
      dispatch(setCallAccepted(true));
      dispatch(setCallActive(true));
      socket.emit("answer_call", callDetails);
      dispatch(setCallStatus("Answered"));
      // start timer
      startTimer();
    }
  };

  const handleAnswerCall = () => {
    console.log("call answered :: userData.id :: ", userData);
    dispatch(setCallIncomming(false));
    dispatch(setCallActive(true));
    dispatch(setCallAccepted(true));
    dispatch(setCallStatus("Answered"));
    // start timer
    startTimer();
  };

  const endCall = async () => {
    if (socket) {
      socket.emit("call_end", callDetails);

      // add call log
      const callLog = {
        duration,
        callerId: callDetails.from.id,
        receiverId: callDetails.to.id,
        startTime: `${callDetails.callDate} ${callDetails.callTime}`,
      };
      const response = await addCall(callLog);
    }
  };

  const handleEndCall = useCallback(async () => {
    console.log("call end");
    stopTimer();
    dispatch(setCallStatus("End call"));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dispatch(setCallActive(false));
    dispatch(setCallAccepted(false));
    dispatch(setCallDetails(null));

    fetchCallLogs();
  }, []);

  useEffect(()=>{
    fetchCallLogs();
  }, [userData])



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
  }, [socket]);

  return callIncomming || callActive ? (
    <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center pointer-events-none">
      {/* Call popover */}
      {callActive ? (
        <div
          className={`${
            isMinimized
              ? " w-[300px] h-[200px] "
              : "w-full h-full md:w-[600px] md:h-[500px]"
          } bg-secondary  
          rounded-lg boxShadow flex flex-col overflow-hidden pointer-events-auto z-50`}
        >
          <div className="w-full flex justify-between items-center p-2">
            <h2 className="text-text text-lg ">Let's Chat</h2>
            <div className="flex gap-2">
              {/* {!isMinimized ? (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-background rounded-full"
                >
                  <AiOutlineFullscreenExit size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-background rounded-full"
                >
                  <AiOutlineFullscreen size={20} />
                </button>
              )} */}
            </div>
          </div>

          <div className="w-full h-full bg-text flex flex-col p-1">
            <div className="w-full h-full bg-background rounded-lg flex flex-col items-center justify-center p-4">
              {!isMinimized && (
                // <div
                //   className="w-28 h-28 bg-surface rounded-full bg-cover overflow-hidden"
                //   style={{
                //     backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
                //   }}
                // >
                //   {callDetails && (
                //     <img
                //       src={callDetails?.to?.profilePic}
                //       alt=""
                //       className="object-cover h-full w-full object-center"
                //     />
                //   )}
                // </div>
                <div className="w-full h-full md:h-[300px] bg-zinc-400 relative overflow-hidden">
                  {/* remote video */}
                  <div className="w-full h-full bg-white overflow-hidden">
                    {/* {remoteVideoRef ? (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      ></video>
                    ) : null} */}
                  </div>
                  {/* my video */}
                  <div
                    className={`bg-white boxShadow z-10 absolute ${
                      callAccepted
                        ? "w-[150px] h-[100px] bottom-2 right-2"
                        : "w-full h-full bottom-0 right-0"
                    } `}
                  >
                    {/* {myVideoRef ? (
                      <video
                        ref={myVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      ></video>
                    ) : null} */}
                  </div>
                </div>
              )}
              <h2 className="leading-5 capitalize line-clamp-1 font-semibold">
                {/* Username */}
                {callDetails?.from?.id === userData?._id
                  ? callDetails.to.name
                  : callDetails.from.name}
              </h2>
              <p className="leading-5">
                {callStatus === "Answered"
                  ? `${
                      (duration / 60).toFixed(0) < 10
                        ? `0${(duration / 60).toFixed(0)}`
                        : (duration / 60).toFixed(0)
                    } : ${
                      duration % 60 < 10 ? `0${duration % 60}` : duration % 60
                    }`
                  : callStatus}
              </p>
            </div>
            <CallPageFooter endCall={endCall} />
          </div>
        </div>
      ) : null}

      {/* incomming call popover */}
      {callIncomming && (
        <div className="w-[300px] absolute right-6 bottom-6 bg-secondary/50 backdrop-blur-md rounded-lg px-2 py-4 flex flex-col items-center boxShadow pointer-events-auto">
          <p className="capitalize font-semibold animate-bounce">
            incomming call...
          </p>
          <div
            className="w-20 h-20 rounded-full bg-cover overflow-hidden"
            style={{
              backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
            }}
          >
            {callDetails && (
              <img
                src={callDetails?.from?.profilePic}
                alt=""
                className="object-cover h-full w-full object-center"
              />
            )}
          </div>
          <h2 className="font-semibold">
            {callDetails?.from?.name || "Username"}
          </h2>
          <div className="flex flex-col w-full gap-1 mt-5">
            <button
              onClick={declineIncommingCall}
              className="w-full py-2 text-text border-[1px] border-text rounded-lg hover:font-semibold duration-100"
            >
              Decline
            </button>
            <button
              onClick={answerIncommingCall}
              className="w-full py-2 text-text rounded-lg bg-[#82B2ED] hover:bg-[#82B2ED]/70  hover:font-semibold duration-100"
            >
              Answer
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default CallPageLayout;
