import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineFullscreenExit } from "react-icons/ai";
import { AiOutlineFullscreen } from "react-icons/ai";
import {
  setCallActive,
  setCallDetails,
  setCallIncomming,
} from "../store/globalSlice";
import { CallPageFooter } from "../components";

const CallPageLayout = () => {
  const callActive = useSelector((state) => state.global.callActive);
  const callIncomming = useSelector((state) => state.global.callIncomming);
  const callDetails = useSelector((state) => state.global.callDetails);
  const [isMinimized, setIsMinimized] = useState(false);
  const dispatch = useDispatch();
  const [duration, setDuration] = useState(0);
  const [callAnswered, setCallAnswered] = useState(false);
  const intervalRef = useRef(null);

  const startDuration = () => {
    intervalRef.current = setInterval(() => {
      setDuration((state) => state + 1);
    }, 1000);
  };

  const handleAnswerIncommingCall = () => {
    dispatch(setCallActive(true));
    dispatch(setCallIncomming(false));
    setCallAnswered(true);
    startDuration();
    console.log("Call Answered");
  };

  const handleDeclineIncommingCall = () => {
    dispatch(setCallIncomming(false));
    dispatch(setCallDetails(null));
    console.log("Call Declined");
  };

  const handleCallEnd = () => {
    dispatch(setCallActive(false));
    dispatch(setCallDetails(null));
    setCallAnswered(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null; // Clear the reference
    setDuration(0);
    console.log("Call End");
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (callIncomming) {
        handleDeclineIncommingCall();
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [callIncomming]);

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
              {!isMinimized ? (
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
              )}
            </div>
          </div>

          <div className="w-full h-full bg-text flex flex-col p-1">
            <div className="w-full h-full bg-background rounded-lg flex flex-col items-center justify-center">
              {!isMinimized && (
                <div
                  className="w-28 h-28 bg-surface rounded-full bg-cover overflow-hidden"
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
              )}
              <h2 className="leading-5 capitalize line-clamp-1 font-semibold">
                {callDetails?.to?.name || "Username"}
              </h2>
              <p className="leading-5">
                {callAnswered
                  ? `${
                      duration / 60 < 10
                        ? `0${(duration / 60).toFixed(0)}`
                        : (duration / 60).toFixed(0)
                    }:${
                      duration % 60 < 10
                        ? `0${(duration % 60).toFixed(0)}`
                        : (duration % 60).toFixed(0)
                    }`
                  : callDetails?.call == "outgoing" && !callAnswered
                  ? "Ringing..."
                  : callDetails?.call == "incomming" && !callAnswered
                  ? "Call End"
                  : null}
              </p>
            </div>
            <CallPageFooter handleCallEnd={handleCallEnd} />
          </div>
        </div>
      ) : null}

      {/* incomming call popover */}
      {callIncomming && (
        <div className="w-[300px] absolute right-6 bottom-6 bg-secondary/50 backdrop-blur-md rounded-lg px-2 py-4 flex flex-col items-center boxShadow pointer-events-auto">
          <p className="capitalize font-semibold animate-bounce">
            incomming call...
          </p>
          <div className="w-20 h-20 bg-primary rounded-full"></div>
          <h2 className="font-semibold">Username</h2>
          <div className="flex flex-col w-full gap-1 mt-5">
            <button
              onClick={handleDeclineIncommingCall}
              className="w-full py-2 text-text border-[1px] border-text rounded-lg hover:font-semibold duration-100"
            >
              Decline
            </button>
            <button
              onClick={handleAnswerIncommingCall}
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
