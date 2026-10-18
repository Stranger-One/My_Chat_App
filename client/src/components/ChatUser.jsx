import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketProvider";
import { IoCheckmarkDone, IoCheckmark } from "react-icons/io5";
import { BsCameraFill, BsMicFill, BsFileEarmarkFill } from "react-icons/bs";
import moment from "moment";

const ChatUser = ({ conversation, setSearchQuery }) => {
  const userData = useSelector((state) => state.global.userData);
  const onlineUsers = useSelector((state) => state.global.onlineUsers);
  const typingUsers = useSelector((state) => state.global.typingUsers);
  const navigate = useNavigate();
  const socket = useSocket();
  const { userId } = useParams();

  const otherUser = conversation?.userDetails;
  const isOnline = onlineUsers?.includes(otherUser?._id);
  const isTyping = typingUsers?.[otherUser?._id];
  const isSelected = userId === otherUser?._id;

  const openChat = () => {
    navigate(`/chat/${otherUser?._id}`, {
      state: { conversationId: conversation?._id },
    });
    if (socket && otherUser?._id && userData?._id) {
      socket.emit("seen", {
        seenUserId: userData._id,
        chatUserId: otherUser._id,
        conversationId: conversation._id,
      });
    }
    if (setSearchQuery) {
      setSearchQuery("");
    }
  };

  // Format timestamp like WhatsApp
  const formatTime = (time) => {
    if (!time) return "";
    const msgDate = moment(time);
    const now = moment();
    if (now.isSame(msgDate, "day")) {
      return msgDate.format("hh:mm A");
    } else if (now.subtract(1, "day").isSame(msgDate, "day")) {
      return "Yesterday";
    } else {
      return msgDate.format("DD/MM/YYYY");
    }
  };

  const lastMsg = conversation?.lastMessage;
  const isSentByMe = lastMsg?.sender === userData?._id;

  const renderSnippet = () => {
    if (isTyping) {
      return <span className="text-wa-teal dark:text-wa-green font-medium animate-pulse">typing...</span>;
    }
    if (!lastMsg) return "Tap to chat";

    if (lastMsg.isDeleted) {
      return <span className="italic text-xs opacity-75">🚫 This message was deleted</span>;
    }

    if (lastMsg.file?.fileUrl) {
      const type = lastMsg.file.fileType || "";
      if (type.includes("image")) {
        return (
          <span className="flex items-center gap-1">
            <BsCameraFill size={13} /> Photo
          </span>
        );
      }
      if (type.includes("audio")) {
        return (
          <span className="flex items-center gap-1">
            <BsMicFill size={13} className="text-wa-teal" /> Voice message
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1">
          <BsFileEarmarkFill size={13} /> Document
        </span>
      );
    }

    return lastMsg.text || "Media";
  };

  return (
    <div
      onClick={openChat}
      className={`w-full flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-wa-border-light dark:border-wa-border-dark select-none ${
        isSelected
          ? "bg-wa-hover-light dark:bg-wa-surface"
          : "hover:bg-wa-hover-light dark:hover:bg-wa-hover-dark"
      }`}
    >
      {/* Contact Avatar */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <img
          src={otherUser?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
          alt={otherUser?.name}
          className="w-full h-full object-cover rounded-full"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-wa-badge border-2 border-white dark:border-wa-panel-dark rounded-full"></span>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-semibold text-wa-text-primary-light dark:text-wa-text-primary-dark truncate capitalize">
            {otherUser?.name || "Unknown"}
          </h3>
          <span className={`text-[12px] whitespace-nowrap ${
            conversation?.unseenMessages > 0 ? "text-wa-teal font-semibold" : "text-wa-text-secondary-light dark:text-wa-text-secondary-dark"
          }`}>
            {formatTime(lastMsg?.createdAt || conversation?.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[13px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark truncate">
            {isSentByMe && !isTyping && (
              <span className="flex-shrink-0 inline-flex items-center">
                {lastMsg?.seen ? (
                  <IoCheckmarkDone size={16} className="text-wa-blue" />
                ) : (
                  <IoCheckmarkDone size={16} className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark" />
                )}
              </span>
            )}
            <p className="truncate leading-tight">
              {renderSnippet()}
            </p>
          </div>

          {conversation?.unseenMessages > 0 && (
            <span className="flex-shrink-0 bg-wa-badge text-white font-bold text-[11px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ml-2">
              {conversation.unseenMessages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUser;
