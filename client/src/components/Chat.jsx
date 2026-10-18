import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReceiveMsg, ChatInputFooter, ChatHeader, SendMsg } from "./index";
import { useSocket } from "../contexts/SocketProvider";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLightboxMedia } from "../store/globalSlice";
import { IoClose, IoDownloadOutline } from "react-icons/io5";
import moment from "moment";

const Chat = () => {
  const onlineUsers = useSelector((state) => state.global.onlineUsers);
  const userData = useSelector((state) => state.global.userData);
  const lightboxMedia = useSelector((state) => state.global.lightboxMedia);
  const [allMessages, setAllMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [inChatSearch, setInChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleUserDetails = useCallback((thisUserDetails) => {
    if (thisUserDetails) {
      setUser(thisUserDetails);
    }
  }, []);

  const handleReceiveMessages = useCallback(
    (conversation) => {
      const isRelevantChat =
        (conversation?.receiver === userData?._id &&
          conversation?.sender === params.userId) ||
        (conversation?.sender === userData?._id &&
          conversation?.receiver === params.userId);

      if (isRelevantChat) {
        setAllMessages(conversation?.messages || []);
        const receiveMessages = conversation?.messages?.filter(
          (message) => message.receiver === userData?._id
        ) || [];

        if (
          receiveMessages.length > 0 &&
          !receiveMessages[receiveMessages.length - 1]?.seen
        ) {
          socket?.emit("seen", {
            seenUserId: userData._id,
            chatUserId: params.userId,
            conversationId: conversation._id,
          });
        }
      }
    },
    [socket, params.userId, userData?._id]
  );

  useEffect(() => {
    if (socket && params.userId) {
      socket.emit("request-chat-messages", params.userId, userData?._id);
      socket.on("chat-user-details", handleUserDetails);
      socket.on("receive-chat-messages", handleReceiveMessages);

      return () => {
        socket.off("receive-chat-messages", handleReceiveMessages);
        socket.off("chat-user-details", handleUserDetails);
      };
    }
  }, [socket, params.userId, userData?._id, handleUserDetails, handleReceiveMessages]);

  // Filter messages if search query is active
  const filteredMessages = chatSearchQuery.trim()
    ? allMessages?.filter((m) =>
        m.text?.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : allMessages;

  // Format date headers between message groups
  const formatDateHeader = (timestamp) => {
    const msgDate = moment(timestamp);
    const now = moment();
    if (now.isSame(msgDate, "day")) {
      return "Today";
    }
    if (now.subtract(1, "day").isSame(msgDate, "day")) {
      return "Yesterday";
    }
    return msgDate.format("MMMM DD, YYYY");
  };

  return (
    <div className="w-full h-full flex flex-col bg-wa-chat-light dark:bg-wa-chat-dark relative overflow-hidden select-text">
      {/* WhatsApp Header */}
      {user ? (
        <ChatHeader
          user={user}
          onlineUsers={onlineUsers}
          onSearchToggle={(val) => {
            setInChatSearch(val);
            if (!val) setChatSearchQuery("");
          }}
          searchQuery={chatSearchQuery}
          setSearchQuery={setChatSearchQuery}
        />
      ) : (
        <div className="h-[60px] bg-wa-header-light dark:bg-wa-header-dark border-b border-wa-border-light dark:border-wa-border-dark flex items-center px-4">
          <div className="h-4 w-32 bg-black/10 dark:bg-white/10 rounded animate-pulse"></div>
        </div>
      )}

      {/* In-Chat Search Bar */}
      {inChatSearch && (
        <div className="px-4 py-2 bg-wa-panel-light dark:bg-wa-panel-dark border-b border-wa-border-light dark:border-wa-border-dark flex items-center justify-between z-20 shadow-sm">
          <input
            type="text"
            placeholder="Search in this chat..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setInChatSearch(false);
              setChatSearchQuery("");
            }}
            className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:text-wa-text-primary-light"
          >
            <IoClose size={18} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area with Authentic WhatsApp Doodle Wallpaper */}
      <div className="whatsapp-chat-bg flex-1 overflow-y-auto px-2 sm:px-6 py-4 flex flex-col justify-start">
        {filteredMessages && filteredMessages.length > 0 ? (
          filteredMessages.map((message, index) => {
            const isSentByMe = message.sender === userData?._id;
            const prevMsg = filteredMessages[index - 1];
            const showDateHeader =
              !prevMsg ||
              !moment(message.createdAt).isSame(moment(prevMsg.createdAt), "day");

            return (
              <React.Fragment key={message._id || index}>
                {/* Floating Date Pill */}
                {showDateHeader && (
                  <div className="flex justify-center my-3 sticky top-2 z-10 select-none">
                    <span className="bg-wa-panel-light dark:bg-wa-panel-dark text-wa-text-secondary-light dark:text-wa-text-secondary-dark text-[11.5px] font-medium py-1 px-3 rounded-lg shadow-sm border border-wa-border-light dark:border-wa-border-dark uppercase tracking-wide">
                      {formatDateHeader(message.createdAt)}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                {isSentByMe ? (
                  <SendMsg message={message} targetUserId={params.userId} />
                ) : (
                  <ReceiveMsg message={message} targetUserId={params.userId} />
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center select-none">
            <span className="bg-wa-panel-light/90 dark:bg-wa-panel-dark/90 backdrop-blur-sm text-wa-text-secondary-light dark:text-wa-text-secondary-dark text-xs py-1 px-4 rounded-lg shadow-sm border border-wa-border-light dark:border-wa-border-dark">
              🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Input Footer */}
      <ChatInputFooter />

      {/* Media Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <a
              href={lightboxMedia.url}
              download={lightboxMedia.name || "media"}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Download"
            >
              <IoDownloadOutline size={22} />
            </a>
            <button
              onClick={() => dispatch(setLightboxMedia(null))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-lg">
            {lightboxMedia.type === "image" ? (
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.name || "Preview"}
                className="w-full h-full object-contain max-h-[85vh]"
              />
            ) : (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain max-h-[85vh]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
