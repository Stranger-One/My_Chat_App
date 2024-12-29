import React from "react";
import { MdCallMissed } from "react-icons/md";
import { MdCallReceived } from "react-icons/md";
import { MdCallMade } from "react-icons/md";
import { useSelector } from "react-redux";

const CallComp = ({ call }) => {
  const userData = useSelector((state) => state.global.userData);

  return (
    <div className="w-full bg-secondary rounded-lg p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white w-10 h-10 rounded-full">
            {
              <img
                src={
                  call.callerId._id === userData._id
                    ? call.receiverId.profilePic
                    : call.callerId.profilePic
                }
                alt="profile"
                className="w-full h-full object-cover rounded-full"
              />
            }
          </div>
          <div className="">
            <h1 className="capitalize font-bold">
              {call.callerId._id === userData._id
                ? call.receiverId.name
                : call.callerId.name}
            </h1>
            <p className="">{call.startTime}</p>
          </div>
        </div>
        <div >
          <div className="">
            {call.callerId._id === userData._id ? (
              <div className="bg-green-500 p-1 w-fit rounded-full">
                <MdCallMade size={20} />
              </div>
            ) : (
              <div className="bg-blue-500 p-1 w-fit rounded-full">
                <MdCallReceived size={20} />
              </div>
            )}
          </div>
          <p className="">{call.duration} sec</p>
        </div>
      </div>
    </div>
  );
};

export default CallComp;
