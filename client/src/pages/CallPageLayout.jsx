import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineFullscreenExit } from "react-icons/ai";
import { AiOutlineFullscreen } from "react-icons/ai";
import {
  setCallAccepted,
  setCallActive,
  setCallDetails,
  setCallIncomming,
} from "../store/globalSlice";
import { CallPageFooter } from "../components";
import { useMedia } from "../contexts/mediaProvider";
import { useSocket } from "../contexts/SocketProvider";
import Peer from "peerjs";

const CallPageLayout = () => {
  const userData = useSelector((state) => state.global.userData);
  const callActive = useSelector((state) => state.global.callActive);
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

  const [incommingCallDetails, setIncommingCallDetails] = useState(null);
  const [incomingCall, setIncomingCall] = useState();

  const startDuration = () => {
    intervalRef.current = setInterval(() => {
      setDuration((state) => state + 1);
    }, 1000);
  };

  const handleIncommingCall = useCallback(
    (details) => {
      // console.log("handleCallReceive", {
      //   ...details,
      //   call: "incomming",
      // });
      // dispatch(
      //   setCallDetails({
      //     ...details,
      //     call: "incomming",
      //   })
      // );
    },
    [socket]
  );

  const handleCallAccepted = useCallback(() => {
    // console.log("call accepted");
    dispatch(setCallAccepted(true));
    startDuration();
  }, []);

  const handleCallRejected = useCallback(() => {
    setRemotePeerId(null);
    setStream(null);
    myVideoRef.current.srcObject=null

    
    dispatch(setCallActive(false));
    dispatch(setCallDetails(null));
    console.log("Call Declined");
  }, []);

  const handleCallEnd = useCallback(() => {
    myVideoRef.current.srcObject = undefined;
    remoteVideoRef.current.srcObject = undefined;
    setCall(null);
    setStream(null)
    dispatch(setCallActive(false));
    dispatch(setCallDetails(null));
    dispatch(setCallAccepted(false));
    clearInterval(intervalRef.current);
    intervalRef.current = null; // Clear the reference
    setDuration(0);

    // console.log("Call End");
  }, []);

  const answerIncommingCall = () => {
    console.log("incoming call answer", incomingCall);
    dispatch(setCallDetails({
      ...incommingCallDetails,
      call: "incomming",
    }));

    socket.emit("answer_call", incommingCallDetails);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideoRef.current.srcObject = stream;
        incomingCall.answer(stream);


        incomingCall?.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
      
      dispatch(setCallAccepted(true));
      dispatch(setCallActive(true));
    dispatch(setCallIncomming(false));

    startDuration();
    // console.log("Call Answered");
  };


  const declineIncommingCall = () => {
    console.log("declineIncommingCall", incomingCall);
    socket.emit("decline_call", incommingCallDetails);
    setIncommingCallDetails(null);
    setIncomingCall(null);
    dispatch(setCallIncomming(false));

    // dispatch(setCallDetails(null));
    // console.log("Call Declined");
  };

  const endCall = () => {
    socket.emit("call_end", incommingCallDetails);

    // myVideoRef.current.srcObject = null;
    // remoteVideoRef.current.srcObject = null;
    // setCall(null);
    // dispatch(setCallActive(false));
    // dispatch(setCallDetails(null));
    // dispatch(setCallAccepted(false));
    // setStream(null);

    // clearInterval(intervalRef.current);
    // intervalRef.current = null; // Clear the reference
    // setDuration(0);

    // console.log("Call End");
  };

  peer?.on("call", (incomingCall) => {
    console.log("incomingCall", incomingCall);
    const callDetails = incomingCall?.metadata?.callerDetails;
    setIncommingCallDetails(callDetails);
    setIncomingCall(incomingCall);
    dispatch(setCallIncomming(true));
  });

  useEffect(() => {
    if (socket) {
      // socket.on("incomming_call", handleIncommingCall);
      socket.on("answer_call", handleCallAccepted);
      socket.on("decline_call", handleCallRejected);
      socket.on("call_end", handleCallEnd);

      return () => {
        // socket.off("incomming_call", handleIncommingCall);
        socket.off("answer_call", handleCallAccepted);
        socket.off("decline_call", handleCallRejected);
        socket.off("call_end", handleCallEnd);
      };
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (callIncomming) {
  //       declineIncommingCall();
  //     }
  //   }, 15000);

  //   return () => clearTimeout(timeout);
  // }, [callIncomming]);

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
                    {remoteVideoRef ? (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      ></video>
                    ) : null}
                  </div>
                  {/* my video */}
                  <div
                    className={`bg-white boxShadow z-10 absolute ${
                      callAccepted
                        ? "w-[150px] h-[100px] bottom-2 right-2"
                        : "w-full h-full bottom-0 right-0"
                    } `}
                  >
                    {myVideoRef ? (
                      <video
                        ref={myVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      ></video>
                    ) : null}
                  </div>
                </div>
              )}
              <h2 className="leading-5 capitalize line-clamp-1 font-semibold">
                {callDetails?.call === "incomming"
                  ? callDetails?.from?.name
                  : callDetails?.to?.name}
              </h2>
              <p className="leading-5">
                {callAccepted
                  ? `${
                      duration / 60 < 10
                        ? `0${(duration / 60).toFixed(0)}`
                        : (duration / 60).toFixed(0)
                    }:${
                      duration % 60 < 10
                        ? `0${(duration % 60).toFixed(0)}`
                        : (duration % 60).toFixed(0)
                    }`
                  : callDetails?.call == "outgoing" && !callAccepted
                  ? "Ringing..."
                  : callDetails?.call == "incomming" && !callAccepted
                  ? "Call End"
                  : null}
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
            className="w-20 h-20 rounded-full bg-cover"
            style={{
              backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
            }}
          >
            {callDetails && (
              <img
                src={callDetails?.to?.profilePic}
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
