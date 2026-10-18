import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { BsReplyFill, BsTrashFill, BsFiles, BsDownload } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setReplyingToMessage, setLightboxMedia } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";
import VoiceNotePlayer from "./VoiceNotePlayer";
import moment from "moment";
import toast from "react-hot-toast";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ReceiveMsg = ({ message, targetUserId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const userData = useSelector((state) => state.global.userData);
  const dispatch = useDispatch();
  const socket = useSocket();

  const formattedTime = moment(message?.createdAt).format("hh:mm A");

  const handleReply = () => {
    dispatch(setReplyingToMessage(message));
    setShowMenu(false);
  };

  const handleCopy = () => {
    if (message?.text) {
      navigator.clipboard.writeText(message.text);
      toast.success("Copied to clipboard");
    }
    setShowMenu(false);
  };

  const handleReact = (emoji) => {
    if (socket && message?._id) {
      socket.emit("message-reaction", {
        messageId: message._id,
        emoji,
        userId: userData?._id,
        receiverId: targetUserId,
      });
    }
    setShowEmojiBar(false);
    setShowMenu(false);
  };

  const handleDeleteForMe = () => {
    if (socket && message?._id) {
      socket.emit("delete-message", {
        messageId: message._id,
        deleteForEveryone: false,
        userId: userData?._id,
        receiverId: targetUserId,
      });
      toast.success("Deleted for you");
    }
    setShowMenu(false);
  };

  const reactionCounts = message?.reactions?.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  if (message?.deletedFor?.includes(userData?._id)) {
    return null;
  }

  return (
    <div className="w-full flex justify-start my-1 px-2 group relative">
      <div className="relative max-w-[85%] md:max-w-[65%] shadow-wa-bubble bubble-recv text-wa-text-primary-light dark:text-wa-text-primary-dark">
        {/* Hover trigger for action menu & emojis */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            className="p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs transition-colors"
            title="React"
          >
            😊
          </button>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs transition-colors"
            title="Menu"
          >
            <IoChevronDown size={14} />
          </button>
        </div>

        {/* Quick Emoji Reaction Bar */}
        {showEmojiBar && (
          <div className="absolute -top-10 left-0 bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark rounded-full shadow-wa-dropdown px-2 py-1 flex items-center gap-1.5 z-30">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transition-transform text-base p-0.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Action Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-7 right-2 w-40 bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark rounded-xl shadow-wa-dropdown py-1 z-30 text-xs">
            <button
              onClick={handleReply}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors"
            >
              <BsReplyFill size={14} /> Reply
            </button>
            {message?.text && (
              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors"
              >
                <BsFiles size={14} /> Copy
              </button>
            )}
            <button
              onClick={handleDeleteForMe}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors text-rose-500"
            >
              <BsTrashFill size={13} /> Delete for me
            </button>
          </div>
        )}

        {/* Quoted / Reply Preview Block */}
        {message?.replyTo && (
          <div className="mx-2 mt-1.5 p-1.5 rounded-md bg-black/5 dark:bg-black/20 border-l-4 border-wa-teal text-xs">
            <p className="font-semibold text-wa-teal dark:text-wa-green truncate">
              {message.replyTo.sender === userData?._id ? "You" : "Contact"}
            </p>
            <p className="truncate opacity-80">
              {message.replyTo.text || (message.replyTo.file?.fileUrl ? "Media" : "Message")}
            </p>
          </div>
        )}

        {/* File / Media Preview */}
        {message?.file?.fileUrl && !message.isDeleted && (
          <div className="overflow-hidden rounded-t-lg">
            {message.file.fileType?.includes("image") ? (
              <img
                src={message.file.fileUrl}
                alt="attachment"
                onClick={() =>
                  dispatch(
                    setLightboxMedia({
                      url: message.file.fileUrl,
                      type: "image",
                      name: message.file.fileName,
                    })
                  )
                }
                className="max-h-[300px] w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            ) : message.file.fileType?.includes("video") ? (
              <video
                controls
                className="max-h-[300px] w-full object-cover rounded-t-lg"
                src={message.file.fileUrl}
              />
            ) : message.file.fileType?.includes("audio") ? (
              <VoiceNotePlayer audioUrl={message.file.fileUrl} isSent={false} />
            ) : (
              <a
                href={message.file.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={message.file.fileName}
                className="flex items-center gap-3 p-3 bg-black/5 dark:bg-black/20 rounded-lg m-1 hover:bg-black/10 transition-colors"
              >
                <div className="p-2 bg-wa-teal text-white rounded-lg">
                  <BsDownload size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{message.file.fileName || "Document"}</p>
                  <p className="text-[10px] opacity-75">Click to download</p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Message Text & Timestamp */}
        <div className="px-2.5 py-1.5 flex flex-wrap items-end justify-end gap-2 min-w-[90px]">
          <p
            className={`text-[14.2px] leading-relaxed break-words max-w-full flex-1 ${
              message?.isDeleted ? "italic opacity-70 text-[13px]" : ""
            }`}
          >
            {message?.text}
          </p>

          <span className="flex-shrink-0 text-[11px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark select-none ml-auto">
            {formattedTime}
          </span>
        </div>

        {/* Reaction badge pills */}
        {reactionCounts && Object.keys(reactionCounts).length > 0 && (
          <div className="absolute -bottom-2.5 right-2 flex items-center bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark shadow-sm rounded-full px-1.5 py-0.5 text-xs gap-1 z-20">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span key={emoji} className="flex items-center gap-0.5">
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] font-semibold">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveMsg;
