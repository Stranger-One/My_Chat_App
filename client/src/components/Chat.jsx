import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { IoVideocamOutline } from "react-icons/io5";
import { RiLinksFill } from "react-icons/ri";
import { LuSend } from "react-icons/lu";
import { ImFileMusic } from "react-icons/im";
import { ImFileVideo } from "react-icons/im";
import { ImFileEmpty } from "react-icons/im";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ReceiveMsg from "./ReceiveMsg";
import SendMsg from "./SendMsg";
import { getUser } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { deleteConversation } from "../services/messageServices";
import { useSocket } from "../contexts/SocketProvider";
import axios from "axios";
import Loader from "./Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import toast from "react-hot-toast";
import { BsEmojiSmile } from "react-icons/bs";
import { MdMicNone } from "react-icons/md";
import { FaStop } from "react-icons/fa6";
import VoiceChatWithProgress from "./VoiceChatWithProgress";
import ChatInputFooter from "./ChatInputFooter";

const Chat = () => {
  const userData = useSelector((state) => state.auth.userData);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  const params = useParams();
  const [user, setUser] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false);

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const conversationId = location?.state?.conversationId;

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

  const handleVoiceCall = () => {
    console.log("handleVoiceCall");
  };
  const handleVideoCall = () => {
    console.log("handleVideoCall");
  };
  const handleThreeDot = () => {
    // console.log("handleThreeDot");
    setIsOpenMenu((menu) => !menu);
    setIsSearchOpen(false);
  };

  const handleDeleteConversation = async () => {
    setButtonLoading(true);
    // console.log("handleDeleteConversation", {
    //   conversationId
    // });
    // Delete conversation logic here
    const response = await deleteConversation(conversationId);
    // console.log("delete response", response);
    navigate("/chat");
    if (response.success) {
      toast.success(response.message);
      socket.emit("request-all-conversation", userData?._id);
    }
    setButtonLoading(false);
  };

  const linkList = [
    // {
    //   path: "",
    //   icon: IoStarOutline,
    //   onclick: handleThreeDot()
    // },
    {
      path: "",
      icon: IoCallOutline,
      onclick: handleVoiceCall,
    },
    {
      path: "",
      icon: IoVideocamOutline,
      onclick: handleVideoCall,
    },
    {
      path: "",
      icon: BsThreeDotsVertical,
      onclick: handleThreeDot,
    },
  ];

  return (
    <div className="w-full h-[calc(100vh-50px)] md:h-screen grid grid-rows-[60px_auto_60px] bg-cover bg-background text-text relative ">
      {user ? (
        <>
          <div className="chat-header bg-secondary w-full flex gap-2 items-center px-4 shadow-xl relative">
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
                  onClick={link.onclick}
                  key={index}
                  className="p-[6px] bg-surface hover:bg-text hover:text-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer"
                >
                  <link.icon size={24} className="" />
                </button>
              ))}
            </div>

            <div
              className={`${
                isOpenMenu ? "inline-block" : "hidden"
              } absolute top-16 right-6 w-[200px] z-20 bg-secondary rounded-l-lg rounded-br-lg`}
            >
              <div className="w-[200px] flex flex-col gap-2 items-start p-2 ">
                <button
                  onClick={() => {
                    setIsOpenMenu(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full py-5 px-4 bg-background rounded-lg flex gap-4 justify-center items-center group"
                >
                  <IoIosSearch
                    size={24}
                    className="group-hover:opacity-0  absolute duration-100"
                  />
                  <span className="opacity-0 group-hover:opacity-100 absolute duration-100 font-semibold">
                    Search Chat
                  </span>
                </button>
                <button
                  onClick={handleDeleteConversation}
                  className="w-full py-5 px-4 bg-background rounded-lg flex gap-4 justify-center items-center group"
                >
                  {buttonLoading ? (
                    <Loader />
                  ) : (
                    <>
                      <AiOutlineDelete
                        size={24}
                        className="group-hover:opacity-0  absolute duration-100"
                      />
                      <span className="opacity-0 group-hover:opacity-100 absolute duration-100 font-semibold">
                        Delete Conversation
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className={`${
                isSearchOpen ? "inline-block" : "hidden"
              } absolute top-16 right-6 w-fit z-20 bg-secondary rounded-l-lg rounded-br-lg`}
            >
              <div className=" flex  gap-2 items-center p-2 ">
                <input
                  type="text"
                  name=""
                  id=""
                  placeholder="Search Message..."
                  className="w-[200px] outline-none bg-background rounded-sm px-2 py-1 placeholder:text-text/70"
                />
                <div className="flex items-center gap-2">
                  <h4>0/0</h4>
                  <button>
                    <IoIosArrowUp size={20} />
                  </button>
                  <button>
                    <IoIosArrowDown size={20} />
                  </button>

                  <button onClick={() => setIsSearchOpen(false)}>
                    <IoClose size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          <h1 className="text-red-600 font-semibold text-xl">User not found</h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
