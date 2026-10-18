import React from "react";
import { MdCallMade, MdCallReceived, MdCallMissed } from "react-icons/md";
import { IoCall, IoVideocam } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CallComp = ({ call }) => {
  const userData = useSelector((state) => state.global.userData);
  const navigate = useNavigate();

  if (!call?.callerId || !call?.receiverId) return null;

  const isOutgoing = call.callerId._id === userData?._id;
  const otherContact = isOutgoing ? call.receiverId : call.callerId;
  const isMissed = !isOutgoing && call.duration === 0;

  const formatDuration = (secs) => {
    if (!secs) return "0s";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleCallContact = (e) => {
    e.stopPropagation();
    navigate(`/chat/${otherContact?._id}`);
  };

  return (
    <div
      onClick={handleCallContact}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-wa-hover-light dark:hover:bg-wa-surface border-b border-wa-border-light dark:border-wa-border-dark cursor-pointer transition-colors select-none"
    >
      <div className="flex items-center gap-3">
        {/* Contact Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={otherContact?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
            alt={otherContact?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contact Name & Call Details */}
        <div>
          <h3 className={`text-[15px] font-semibold capitalize ${isMissed ? "text-rose-500" : "text-wa-text-primary-light dark:text-wa-text-primary-dark"}`}>
            {otherContact?.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-0.5">
            {isOutgoing ? (
              <MdCallMade size={15} className="text-wa-teal" />
            ) : isMissed ? (
              <MdCallMissed size={15} className="text-rose-500" />
            ) : (
              <MdCallReceived size={15} className="text-wa-teal" />
            )}
            <span>{call.startTime}</span>
            {call.duration > 0 && <span>• {formatDuration(call.duration)}</span>}
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <button
        type="button"
        onClick={handleCallContact}
        className="p-2.5 rounded-full text-wa-teal hover:bg-wa-teal/10 transition-colors"
        title="Call contact"
      >
        {call.callType === "voice" ? <IoCall size={20} /> : <IoVideocam size={22} />}
      </button>
    </div>
  );
};

export default CallComp;
