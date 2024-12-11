import React, { useState } from "react";
import { IoVideocamOutline } from "react-icons/io5";
import { MdOutlineCallEnd } from "react-icons/md";
import { IoMicOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { IoMicOffOutline } from "react-icons/io5";
import { IoVideocamOffOutline } from "react-icons/io5";

import { setCallActive, setCallDetails } from "../store/globalSlice";
import { useMedia } from "../contexts/mediaProvider";

const CallPageFooter = ({endCall}) => {
  const {peer, setPeer, myPeerId, setMyPeerId, remotePeerId, setRemotePeerId, stream, setStream, call, setCall, myVideoRef, remoteVideoRef } = useMedia()
  const dispatch = useDispatch();

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);


  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      console.log(videoTrack.enabled);
      setIsVideoMuted(!videoTrack.enabled);
    }
  };
  
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      console.log(audioTrack.enabled);
      setIsAudioMuted(!audioTrack.enabled);
    }
  };



  const actions = [
    {
      icon: IoMicOffOutline,
      onclick: toggleAudio,
    },
    {
      icon: IoVideocamOffOutline,
      onclick: toggleVideo,
    },
  ];

  return (
    <div className="w-full h-20 flex gap-2 items-center justify-center">
        <button
          onClick={toggleAudio}
          className={`p-[6px] ${isAudioMuted ? "bg-background" : "bg-background/70"} hover:bg-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer`}
        >
          <IoMicOffOutline size={24} className="" />
        </button>
        <button
          onClick={toggleVideo}
          className={`p-[6px] ${isVideoMuted ? "bg-background" : "bg-background/70"} hover:bg-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer`}
        >
          <IoVideocamOffOutline size={24} className="" />
        </button>
      <button
        onClick={endCall}
        className="py-[6px] px-4 bg-red-500/70 hover:bg-red-500 duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer"
      >
        <MdOutlineCallEnd size={24} className="" />
      </button>
    </div>
  );
};

export default CallPageFooter;
