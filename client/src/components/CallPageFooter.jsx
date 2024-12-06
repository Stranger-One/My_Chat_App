import React from "react";
import { IoVideocamOutline } from "react-icons/io5";
import { MdOutlineCallEnd } from "react-icons/md";
import { IoMicOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setCallActive, setCallDetails } from "../store/globalSlice";

const CallPageFooter = ({endCall}) => {
  const dispatch = useDispatch();

  const handleMic = () => {};
  const handleVideo = () => {};



  const actions = [
    {
      icon: IoMicOutline,
      onclick: handleMic,
    },
    {
      icon: IoVideocamOutline,
      onclick: handleVideo,
    },
  ];

  return (
    <div className="w-full h-20 flex gap-2 items-center justify-center">
      {actions.map((item, index) => (
        <button
          onClick={item.onclick}
          key={index}
          className="p-[6px] bg-background/70 hover:bg-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer"
        >
          <item.icon size={24} className="" />
        </button>
      ))}
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
