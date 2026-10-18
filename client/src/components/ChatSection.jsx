import React, { useEffect, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { BsPlusLg, BsFilter } from "react-icons/bs";
import ChatUser from "./ChatUser";
import { useDispatch, useSelector } from "react-redux";
import { findConversation } from "../services/messageServices";
import { setAllConversation } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";
import { useNavigate } from "react-router-dom";

const ChatSection = ({ className = "" }) => {
  const allConversation = useSelector((state) => state.global.allConversation);
  const userData = useSelector((state) => state.global.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const socket = useSocket();

  const handleFindConversations = async () => {
    if (!searchQuery.trim()) return;
    const response = await findConversation(searchQuery, userData?._id);
    if (response?.users) {
      dispatch(setAllConversation(response.users));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleFindConversations();
      } else if (socket && userData?._id) {
        socket.emit("request-all-conversation", userData._id);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, socket, userData?._id]);

  const displayedConversations = filterUnread
    ? allConversation?.filter((c) => (c?.unseenMessages || 0) > 0)
    : allConversation;

  return (
    <div
      className={`${className} w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark border-r border-wa-border-light dark:border-wa-border-dark flex-shrink-0 select-none`}
    >
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-wa-border-light dark:border-wa-border-dark bg-wa-header-light dark:bg-wa-header-dark">
        <h1 className="text-xl font-bold text-wa-text-primary-light dark:text-wa-text-primary-dark">
          Chats
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            title={filterUnread ? "Show all chats" : "Filter unread chats"}
            className={`p-2 rounded-full transition-colors ${
              filterUnread
                ? "bg-wa-teal text-white"
                : "text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-border-light dark:hover:bg-wa-surface"
            }`}
          >
            <BsFilter size={20} />
          </button>
          <button
            onClick={() => navigate("/find-user")}
            title="New Chat"
            className="p-2 rounded-full text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-border-light dark:hover:bg-wa-surface transition-colors"
          >
            <BsPlusLg size={18} />
          </button>
        </div>
      </div>

      {/* WhatsApp Search Input Bar */}
      <div className="p-2.5 border-b border-wa-border-light dark:border-wa-border-dark">
        <div className="relative flex items-center bg-wa-surface rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-wa-teal">
          <IoSearch
            size={18}
            className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark flex-shrink-0 mr-2"
          />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-[14px] text-wa-text-primary-light dark:text-wa-text-primary-dark placeholder:text-wa-text-secondary-light dark:placeholder:text-wa-text-secondary-dark outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:text-wa-text-primary-light dark:hover:text-wa-text-primary-dark"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {displayedConversations && displayedConversations.length > 0 ? (
          displayedConversations.map((conversation, index) => (
            <ChatUser
              key={conversation?._id || index}
              conversation={conversation}
              setSearchQuery={setSearchQuery}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 px-4 text-center text-wa-text-secondary-light dark:text-wa-text-secondary-dark text-sm">
            <p className="font-medium text-base mb-1">No chats found</p>
            <p>Click the '+' button to start a new chat with your contacts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;
