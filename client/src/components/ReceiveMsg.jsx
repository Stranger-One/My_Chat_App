import React from "react";
import { IoCheckmarkDone } from "react-icons/io5";
import { LuDownload } from "react-icons/lu";

const ReceiveMsg = ({ message }) => {
  const messageTime = new Date(message?.createdAt)
    .toLocaleTimeString("en-US", { hour12: true })
    .split(":");
  const time = `${
    messageTime[0] < 10 ? `0${messageTime[0]}` : messageTime[0]
  }:${messageTime[1]} ${messageTime[2].split(" ")[1]}`;
  // console.log("message time", time);

  return (
    <div className="w-full flex justify-start">
      <div
        className="p-1 max-w-[310px] w-fit rounded-t-lg rounded-br-lg flex justify-end items-start flex-col bg-green-400"
        style={{
          backgroundImage:
            "radial-gradient( circle 311px at 8.6% 27.9%,  rgba(239,183,192,0.44) 12.9%, rgba(62,147,252,0.57) 91.2% )",
        }}
      >
        {message?.file && (
          <div className=" rounded-lg overflow-hidden relative cursor-pointer ">
            {message?.file.fileType.includes("image") ? (
              <img
                src={message?.file.fileUrl}
                alt="message"
                className="w-full h-full object-cover"
              />
            ) : message?.file.fileType.includes("audio") ? (
              <audio controls>
                <source src={message?.file.fileUrl} type="audio/mpeg" />
              </audio>
            ) : message?.file.fileType.includes("video") ? (
              <video controls width="500">
                <source src={message?.file.fileUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            ) : message?.file.fileType.includes("application") ? (
              // <iframe src={message?.file.fileUrl} width="100%" height="200px" />
              <h1 className="capitalize">other file</h1>
            ) : (
              ""
            )}
          </div>
        )}
        <div className="flex w-full flex-wrap justify-between ">
          <p className="text-text leading-[18px] p-1 overflow-hidden">
            {message?.text}
          </p>
          <div className="w-fit flex gap-1 items-end">
            <p className="text-sm text-surface">{time}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMsg;
