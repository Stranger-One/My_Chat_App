import React from "react";
import { MdCallMissed } from "react-icons/md";
import { MdCallReceived } from "react-icons/md";
import { MdCallMade } from "react-icons/md";

const CallComp = ({ call }) => {
  return (
    <div className="w-full bg-secondary rounded-lg p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white w-10 h-10 rounded-full"></div>
          <div className="">
            <h1 className="capitalize font-bold">{call.to}</h1>
            <p className="">{call.startCall}</p>
          </div>
          <div className="">
            {call.status === "missedCall" ? (
              <div className="bg-red-500 p-2 rounded-full">
                <MdCallMissed size={20} />
              </div>
            ) : call.status === "incommingCall" ? (
              <div className="bg-green-500 p-2 rounded-full">
                <MdCallReceived size={20} />
              </div>
            ) : call.status === "outgoingCall" ? (
              <div className="bg-blue-500 p-2 rounded-full">
                <MdCallMade size={20} />
              </div>
            ) : null}
          </div>
        </div>
        <div>
          <p className="">{call.duration} sec</p>
        </div>
      </div>
    </div>
  );
};

export default CallComp;
