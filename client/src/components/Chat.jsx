import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoStarOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { IoVideocamOutline } from "react-icons/io5";
import { RiLinksFill } from "react-icons/ri";
import { LuSend } from "react-icons/lu";

import { Link, useParams } from "react-router-dom";
import ReceiveMsg from "./ReceiveMsg";
import SendMsg from "./SendMsg";
import { getUser } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { getConversation } from "../services/messageServices";
import { setCurrentChatId } from "../store/authSlice";

const Chat = () => {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messageImageUrl, setMessageImageUrl] = useState("");
  const [messageVideoUrl, setMessageVideoUrl] = useState("");
  const [btnBg, setBtnBg] = useState("bg-primary");
  const socketConnection = useSelector((state) => state.auth.socketConnection);
  const userData = useSelector((state) => state.auth.userData);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  const [allMessages, setAllMessages] = useState([]);
  const currentChatId = useSelector((state) => state.auth.currentChatId);
  const allConversation = useSelector((state) => state.auth.allConversation);

  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // useEffect(()=>{
  //   const userId = params.userId;

  //   const chatMessages = allConversation.includes(userId)
  //   console.log(chatMessages);

  // }, [allConversation])

  useEffect(() => {
    if (socketConnection) {
      // Request chat messages when the component mounts or currentChatId changes
      socketConnection.emit(
        "request-chat-messages",
        params.userId,
        userData?._id
      );

      // Listen for user details
      socketConnection.on("chat-user-details", (thisUserDetails) => {
        if (thisUserDetails) {
          setUser(thisUserDetails);
        }
      });

      // Listen for new chat messages
      const handleReceiveMessages = (conversation) => {
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
          // console.log(conversation?.messages[conversation?.messages.length - 1].seen);
          if (!conversation?.messages[conversation?.messages.length - 1].seen) {
            socketConnection.emit("seen", {
              seenUserId: userData._id,
              chatUserId: params.userId,
              conversationId: conversation._id,
            });
          }
        } else {
          // console.log("Irrelevant chat, ignoring messages.");
        }
      };

      socketConnection.on("receive-chat-messages", handleReceiveMessages);

      // console.log("Socket listeners set up");

      // Clean up listeners when the component unmounts or currentChatId changes
      return () => {
        socketConnection.off("receive-chat-messages", handleReceiveMessages);
        socketConnection.off("chat-user-details");
      };
    }
  }, [socketConnection, params.userId]);

  // useEffect(() => {
  //   socketConnection.on("fetch-messages", (conversation) => {
  //     console.log("fetch-messages", conversation);
  //     if (currentChatId == conversation.messages[conversation.messages.length -1 ].sender && conversation.messages[conversation.messages.length -1 ].seen == false) {
  //       socketConnection.emit("seen", {
  //         seenUserId: userData._id,
  //         chatUserId: currentChatId,
  //         conversationId: conversation._id
  //       })
  //     }
  //   });
  // }, [ currentChatId]);

  // emit send message event
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (messageText) {
      socketConnection?.emit("send-message", {
        text: messageText,
        imageUrl: messageImageUrl,
        videoUrl: messageVideoUrl,
        sender: userData._id,
        receiver: params.userId,
      });
      setMessageText("");
      setMessageImageUrl("");
      setMessageVideoUrl("");
    }
  };

  const linkList = [
    {
      path: "",
      icon: IoStarOutline,
    },
    {
      path: "",
      icon: IoCallOutline,
    },
    {
      path: "",
      icon: IoVideocamOutline,
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-50px)] md:h-screen grid grid-rows-[60px_auto_60px] bg-cover bg-background text-text relative ">
      {user ? (
        <>
          <div className="chat-header bg-secondary w-full flex gap-2 items-center px-4 shadow-xl">
            <Link
              to="/"
              className="p-2 bg-surface hover:bg-background duration-150 cursor-pointer rounded-full "
            >
              <FaArrowLeft size={20} className="text-text" />
            </Link>
            <Link
              to="profile"
              className="w-full grid grid-cols-[40px_auto] p-1 gap-2 rounded-md"
            >
              <div
                className="w-10 h-10 bg-surface rounded-full bg-cover overflow-hidden"
                style={{
                  backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
                }}
              >
                <img src={user?.profilePic} alt="" className="object-cover" />
              </div>

              <div className="">
                <h2 className="user-name line-clamp-1 font-semibold capitalize leading-5">
                  {user?.name}
                </h2>
                <p
                  className={`active-status line-clamp-1 leading-5 font-semibold text-sm ${
                    onlineUsers.includes(user._id)
                      ? "text-text"
                      : "text-text/70"
                  }`}
                >
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </p>
              </div>
            </Link>
            <div className="flex flex-nowrap items-center gap-2 ">
              {linkList.map((link, index) => (
                <button
                  key={index}
                  className="p-[6px] bg-surface hover:bg-text hover:text-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer"
                >
                  <link.icon size={24} className="" />
                </button>
              ))}
            </div>
          </div>
          <div className="chat-messages overflow-auto h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] relative w-full">
            {!userData.verified ? (
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
          <div className="chat-footer w-full mt-1">
            <form
              onSubmit={handleSendMessage}
              className="w-[80%] mx-auto flex gap-4"
            >
              <div className="flex w-full rounded-md bg-secondary items-center px-2">
                <input
                  disabled={!userData?.verified}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a messages..."
                  className="w-full p-2 outline-none border-none bg-transparent placeholder:text-text/70 "
                />
                <label htmlFor="file" className="cursor-pointer">
                  <RiLinksFill size={24} className="text-text" />
                </label>
                <input type="file" className="hidden" id="file" />
              </div>
              <button
                type="submit"
                className="bg-primary/60 p-1 rounded-full hover:rounded-lg duration-150"
              >
                <div
                  onMouseDown={() => setBtnBg("bg-primary/60")}
                  onMouseUp={() => setBtnBg("bg-primary")}
                  className={`${btnBg} p-2 rounded-full hover:rounded-lg duration-150`}
                >
                  <LuSend size={20} />
                </div>
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center w-full md:h-screen">
          <h1 className="text-red-600 font-semibold text-xl">User not found</h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
