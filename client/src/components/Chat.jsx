import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoClose, IoStarOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { IoVideocamOutline } from "react-icons/io5";
import { RiLinksFill } from "react-icons/ri";
import { LuSend } from "react-icons/lu";
import { ImFileMusic } from "react-icons/im";
import { ImFileVideo } from "react-icons/im";
import { ImFileEmpty } from "react-icons/im";

import { Link, useParams } from "react-router-dom";
import ReceiveMsg from "./ReceiveMsg";
import SendMsg from "./SendMsg";
import { getUser } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { getConversation } from "../services/messageServices";
import { setCurrentChatId } from "../store/authSlice";
import { useSocket } from "../contexts/SocketProvider";
import axios from "axios";
import Loader from "./Loader";

const Chat = () => {
  const userData = useSelector((state) => state.auth.userData);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  const params = useParams();
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [btnBg, setBtnBg] = useState("bg-primary");
  const [allMessages, setAllMessages] = useState([]);
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const [fileSelected, setFileSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;
    setFileSelected(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const filePreview = URL.createObjectURL(selectedFile);
      setFilePreview(filePreview);
    } else {
      // For non-image files, reset the preview
      // setFilePreview(null);
    }
  };

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
    // Request chat messages when the component mounts or currentChatId changes
    socket.emit("request-chat-messages", params.userId, userData?._id);

    // Listen for user details
    socket.on("chat-user-details", handleUserDetails);
    socket.on("receive-chat-messages", handleReceiveMessages);

    return () => {
      socket.off("receive-chat-messages", handleReceiveMessages);
      socket.off("chat-user-details", handleUserDetails);
    };
  }, [socket, params.userId]);

  // emit send message event
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    let fileUrl = "";
    let messageVideoUrl = "";

    if (fileSelected) {
      const data = new FormData();
      data.append("file", fileSelected);

      // console.log("data", data);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
        data
      );

      fileUrl = response.data.file.path;
    }

    if (messageText) {
      socket.emit("send-message", {
        text: messageText,
        sender: userData._id,
        receiver: params.userId,
        file: {
          fileName: fileSelected.name,
          fileType: fileSelected.type,
          fileUrl: fileUrl,
          fileSize: fileSelected.size,
        },
      });
      setMessageText("");
      setFileSelected(null);
    }
    setSendingMessage(false);
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
                <img
                  src={user?.profilePic}
                  alt=""
                  className="object-cover h-full w-full object-center"
                />
              </div>

              <div className="">
                <h2 className="user-name line-clamp-1 font-semibold capitalize leading-5">
                  {user?.name}
                </h2>
                <p
                  className={`active-status line-clamp-1 leading-5 font-semibold text-sm ${
                    onlineUsers?.includes(user._id)
                      ? "text-text"
                      : "text-text/70"
                  }`}
                >
                  {onlineUsers?.includes(user._id) ? "Online" : "Offline"}
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
              className="w-[80%] mx-auto flex gap-4 relative"
            >
              {fileSelected && (
                <div className="w-[300px] absolute bottom-12 left-0 bg-secondary  rounded-t-lg p-2">
                  <div className="flex item-center justify-between">
                    <div className=""></div>
                    <button
                      onClick={() => setFileSelected(null)}
                      className=" mb-2 hover:bg-background duration-100 p-1 rounded-full"
                    >
                      <IoClose size={24} />
                    </button>
                  </div>
                  <div className="w-full h-[200px]">
                    {fileSelected.type.startsWith("image/") ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover object-center rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col h-full w-full items-center justify-center px-4">
                        {
                          <div className="file-icon mb-4">
                            {fileSelected.type.startsWith("audio/") ? (
                              <ImFileMusic size={30} />
                            ) : fileSelected.type.startsWith("video/") ? (
                              <ImFileVideo size={30} />
                            ) : (
                              <ImFileEmpty size={30} />
                            )}
                          </div>
                        }
                        <p className="line-clamp-1">
                          File Name: {fileSelected.name}
                        </p>
                        <p className="line-clamp-1">
                          File Type: {fileSelected.type}
                        </p>
                        <p className="line-clamp-1">
                          File Size:{" "}
                          {(fileSelected.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                <input
                  type="file"
                  className="hidden"
                  id="file"
                  onChange={handleFileChange}
                />
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
                  {sendingMessage ? <Loader size={20} /> : <LuSend size={20} />}
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
