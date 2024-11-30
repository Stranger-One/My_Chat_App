import React from "react";
import { ImFileEmpty, ImFileMusic, ImFileVideo } from "react-icons/im";
import { IoCheckmarkDone } from "react-icons/io5";
import { LuDownload } from "react-icons/lu";

const SendMsg = ({ message }) => {
  // console.log("message", message);
  return (
    <div className="w-full flex justify-end">
      <div
        className="p-1 max-w-[350px] w-fit rounded-t-lg rounded-bl-lg flex justify-end items-end flex-col"
        style={{
          backgroundImage:
            "radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )",
        }}
      >
        {message?.file && (
          <div className="w-full rounded-lg overflow-hidden relative cursor-pointer">
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
            {/* <button className="absolute bottom-2 right-2 p-1 bg-background hover:bg-background/70 duration-100 rounded-lg">
              <LuDownload size={20} className="text-text" />
            </button> */}
          </div>
        )}
        <div className="flex w-full flex-wrap justify-end">
          <p className="text-text leading-[18px] p-1 overflow-hidden">
            {message?.text}
          </p>
          <div className="w-fit flex gap-1 items-end">
            <p className="text-sm text-surface">{`${
              message?.createdAt.split("T")[1].split(":")[0] > 12
                ? message?.createdAt.split("T")[1].split(":")[0] - 12
                : message?.createdAt.split("T")[1].split(":")[0]
            }:${message?.createdAt.split("T")[1].split(":")[1]} ${
              message?.createdAt.split("T")[1].split(":")[0] >= 12 ? "PM" : "AM"
            }`}</p>

            <IoCheckmarkDone
              size={16}
              color={message?.seen ? "green" : "white"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMsg;
