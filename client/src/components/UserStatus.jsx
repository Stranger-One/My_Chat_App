import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentChatId } from "../store/authSlice";
import { useSocket } from "../contexts/SocketProvider";
import { FiPlus } from "react-icons/fi";

const UserStatus = ({ status, myStatus, index }) => {
  const userData = useSelector((state) => state.auth.userData);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  // console.log("status", status);

  const openChat = () => {
    navigate(`/updates/${index}/${status?.userDetails?._id}`);
  };

  const handleAddStatus = (e) => {
    e.stopPropagation()
    navigate('/updates/add')
  };


  return (
    <div
      onClick={openChat}
      className={`w-full grid ${
        myStatus
          ? "grid-cols-[40px_auto_40px] gap-1"
          : "grid-cols-[40px_auto] gap-2"
      }  p-1 hover:bg-background duration-150 rounded-md cursor-pointer items-center text-text`}
    >
      <div
        className="w-10 h-10 bg-surface rounded-full bg-cover relative border-[3px] border-primary"
        style={{
          backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
        }}
      >
        <img
          src={status?.userDetails?.profilePic}
          alt=""
          className="object-cover h-full w-full rounded-full"
        />
      </div>
      <div className="">
        <h2 className="user-name line-clamp-1 font-semibold capitalize leading-5 ">
          {status?.userDetails?.name}
        </h2>

        <p className="last-chat line-clamp-1 leading-5 text-text/70">
          {status?.files ? 'Today 09:10 AM' : 'No Status'}
        </p>
      </div>
      {myStatus && (
        <div className="w-full flex justify-center z-10 ">
          <button type="button" onClick={handleAddStatus} className="p-[6px] rounded-full bg-primary">
            <FiPlus size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserStatus;
