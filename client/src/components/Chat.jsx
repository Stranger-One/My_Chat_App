import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReceiveMsg, ChatInputFooter, ChatHeader, SendMsg } from "./index";
import { useSocket } from "../contexts/SocketProvider";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Chat = () => {
  const onlineUsers = useSelector((state) => state.global.onlineUsers);
  const userData = useSelector((state) => state.global.userData);
  const [allMessages, setAllMessages] = useState([]);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const params = useParams();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleUserDetails = useCallback((thisUserDetails) => {
    if (thisUserDetails) {
      setUser(thisUserDetails);
    }
  }, []);

  // Listen for new chat messages
  const handleReceiveMessages = useCallback(
    (conversation) => {
      // console.log("receive-chat-messages", conversation);
      // console.log("params.userId", params.userId);

      // Ensure the message belongs to the currently opened chat
      const isRelevantChat =
        (conversation?.receiver === userData?._id &&
          conversation?.sender === params.userId) ||
        (conversation?.sender === userData?._id &&
          conversation?.receiver === params.userId);

      // console.log("isRelevantChat", isRelevantChat);

      // Only update messages if the chat is relevant
      if (isRelevantChat) {
        setAllMessages(conversation?.messages);
        const receiveMessages = conversation?.messages.filter(
          (message) => message.receiver === userData._id
        );
        // console.log(receiveMessages);

        if (!receiveMessages[receiveMessages.length - 1].seen) {
          socket.emit("seen", {
            seenUserId: userData._id,
            chatUserId: params.userId,
            conversationId: conversation._id,
          });
        }
      } else {
        // console.log("Irrelevant chat, ignoring messages.");
      }
    },
    [socket, params.userId]
  );

  useEffect(() => {
    if(socket){
      // Request chat messages when the component mounts or currentChatId changes
      socket.emit("request-chat-messages", params.userId, userData?._id);
  
      // Listen for user details
      socket.on("chat-user-details", handleUserDetails);
      socket.on("receive-chat-messages", handleReceiveMessages);
  
      return () => {
        socket.off("receive-chat-messages", handleReceiveMessages);
        socket.off("chat-user-details", handleUserDetails);
      };
    }
  }, [socket, params.userId]);

  return (
    <div className="w-full h-[calc(100vh-50px)] md:h-screen grid grid-rows-[60px_auto_60px] bg-cover bg-background text-text relative ">
      {user ? (
        <>
          {/* Chat Header */}
          <ChatHeader user={user} onlineUsers={onlineUsers} />

          <div className="chat-messages overflow-auto h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] relative w-full">
            {!userData?.verified ? (
              <div className="absolute top-0 left-0 w-full h-full bg-background flex flex-col items-center justify-center ">
                <h1 className="text-red-600 text-2xl">
                  Verify Your Email to Start chat
                </h1>
                <Link to="/profile/verify-account" className="hover:underline">
                  Verify here
                </Link>
              </div>
            ) : (
              <div className="w-full p-2 h-full md:h-fit flex flex-col gap-[2px] ">
                {allMessages?.length > 0 ? (
                  allMessages?.map((message, index) =>
                    message.sender == userData?._id ? (
                      <SendMsg key={index} message={message} />
                    ) : (
                      <ReceiveMsg key={index} message={message} />
                    )
                  )
                ) : (
                  <div className="text-center text-lg p-4">No messages yet</div>
                )}

                {/* Scroll target */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input Footer */}
          <ChatInputFooter />
        </>
      ) : (
        <div className="flex justify-center items-center w-full md:h-screen">
          <h1 className="text-text font-semibold text-xl">
            Loading Messages...
          </h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
