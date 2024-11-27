import React from "react";
import { IoCheckmarkDone } from "react-icons/io5";

const SendMsg = ({ message }) => {
  // console.log("message", message);
  return (
    <div className="w-full flex justify-end">
      <div
        className="p-1 max-w-[300px] w-fit rounded-t-lg rounded-bl-lg bg-secondary flex justify-end items-end gap-2 flex-wrap"
        style={
          {
            backgroundImage: "radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )"
          }
        }
      >
        <p className="text-text leading-[18px] p-1 overflow-hidden">{message.text}</p>
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
  );
};

export default SendMsg;
