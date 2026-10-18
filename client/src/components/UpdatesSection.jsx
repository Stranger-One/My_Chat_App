import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAllUserStatus } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";
import { BsPlusLg } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const UpdatesSection = ({ className = "" }) => {
  const userData = useSelector((state) => state.global.userData);
  const allUserStatus = useSelector((state) => state.global.allUserStatus);
  const dispatch = useDispatch();
  const socket = useSocket();
  const navigate = useNavigate();
  const { statusUserId } = useParams();

  const handleGetStatus = useCallback(
    (response) => {
      dispatch(setAllUserStatus(response || []));
    },
    [dispatch]
  );

  useEffect(() => {
    if (socket) {
      socket.emit("get_status");
      socket.on("get_status", handleGetStatus);

      return () => {
        socket.off("get_status", handleGetStatus);
      };
    }
  }, [socket, handleGetStatus]);

  // Separate my status from others
  const myStatusObj = allUserStatus?.find(
    (s) => s.userDetails?._id === userData?._id
  );
  const otherStatuses = allUserStatus?.filter(
    (s) => s.userDetails?._id !== userData?._id
  );

  const formatTime = (time) => {
    if (!time) return "Today";
    const m = moment(time);
    const now = moment();
    if (now.isSame(m, "day")) {
      return `Today, ${m.format("hh:mm A")}`;
    }
    return `Yesterday, ${m.format("hh:mm A")}`;
  };

  return (
    <div
      className={`${className} w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark border-r border-wa-border-light dark:border-wa-border-dark flex-shrink-0 select-none`}
    >
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-wa-border-light dark:border-wa-border-dark bg-wa-header-light dark:bg-wa-header-dark">
        <h1 className="text-xl font-bold text-wa-text-primary-light dark:text-wa-text-primary-dark">
          Status
        </h1>
        <button
          onClick={() => navigate("/updates/add")}
          title="Add status"
          className="p-2 rounded-full text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-border-light dark:hover:bg-wa-surface transition-colors"
        >
          <BsPlusLg size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* My Status Card */}
        <div
          onClick={() => {
            if (myStatusObj?.files?.length > 0) {
              navigate(`/updates/0/${userData?._id}`);
            } else {
              navigate("/updates/add");
            }
          }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-wa-hover-light dark:hover:bg-wa-surface cursor-pointer transition-colors"
        >
          <div className="relative w-12 h-12 flex-shrink-0">
            <div
              className={`w-12 h-12 rounded-full overflow-hidden p-0.5 ${
                myStatusObj?.files?.length > 0
                  ? "ring-2 ring-wa-teal"
                  : "border border-wa-border-light dark:border-wa-border-dark"
              }`}
            >
              <img
                src={userData?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                alt="My profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/updates/add");
              }}
              title="Add status"
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-wa-teal text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <BsPlusLg size={11} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-wa-text-primary-light dark:text-wa-text-primary-dark truncate">
              My status
            </h3>
            <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark truncate">
              {myStatusObj?.files?.length > 0
                ? formatTime(myStatusObj.files[myStatusObj.files.length - 1]?.createdAt)
                : "Tap to add status update"}
            </p>
          </div>
        </div>

        <div className="my-2 border-t border-wa-border-light dark:border-wa-border-dark"></div>

        {/* Recent Updates Header */}
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-wa-teal">
          Recent updates
        </div>

        {/* Other Contacts Status List */}
        {otherStatuses && otherStatuses.length > 0 ? (
          otherStatuses.map((status, index) => {
            const isSelected = statusUserId === status.userDetails?._id;
            const lastFile = status.files?.[status.files.length - 1];

            return (
              <div
                key={status.userDetails?._id || index}
                onClick={() =>
                  navigate(`/updates/${index}/${status.userDetails?._id}`)
                }
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-wa-hover-light dark:bg-wa-surface"
                    : "hover:bg-wa-hover-light dark:hover:bg-wa-hover-dark"
                }`}
              >
                {/* Status Avatar with green WhatsApp status ring */}
                <div className="w-12 h-12 rounded-full p-0.5 ring-2 ring-wa-teal flex-shrink-0 overflow-hidden">
                  <img
                    src={status.userDetails?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                    alt={status.userDetails?.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-wa-text-primary-light dark:text-wa-text-primary-dark truncate capitalize">
                    {status.userDetails?.name}
                  </h3>
                  <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark truncate">
                    {formatTime(lastFile?.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-wa-text-secondary-light dark:text-wa-text-secondary-dark text-xs px-4">
            <p className="font-semibold text-sm mb-1">No updates yet</p>
            <p>Status updates from your contacts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatesSection;
