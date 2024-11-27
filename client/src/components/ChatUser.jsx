import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCurrentChatId } from "../store/authSlice";

const ChatUser = ({ conversation, setSearchQuery }) => {
  const userData = useSelector((state) => state.auth.userData);
  const socketConnection = useSelector((state) => state.auth.socketConnection);
  const currentChatId = useSelector(state => state.auth.currentChatId)
  const onlineUsers = useSelector(state => state.auth.onlineUsers)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const openChat = () => {
    navigate(`/chat/${conversation?.userDetails?._id}`)
    dispatch(setCurrentChatId(conversation?.userDetails?._id))
    socketConnection.emit("seen", {
      seenUserId: userData._id,
      chatUserId: conversation?.userDetails?._id,
      conversationId: conversation._id
    })
    setSearchQuery('')
  };



  return (
      <div onClick={openChat} className="w-full grid grid-cols-[40px_auto_50px] p-1 gap-1 hover:bg-background duration-150 rounded-md cursor-pointer text-text">
        <div
          className="w-10 h-10 bg-surface rounded-full bg-cover relative"
          style={{
            backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
          }}
        >
          <img
            src={conversation?.userDetails?.profilePic}
            alt=""
            className="object-cover h-full w-full rounded-full"
          />
          {onlineUsers?.includes(conversation?.userDetails?._id) && (
            <div className="absolute w-2 h-2 rounded-full bg-primary bottom-1 right-1"></div>
          )}
        </div>
        <div className="">
          <h2 className="user-name line-clamp-1 font-semibold capitalize leading-5 ">
            {conversation?.userDetails?.name}
          </h2>
          <p className="last-chat line-clamp-1 leading-5 text-text/70">
            {conversation?.lastMessage?.sender == userData?._id ? "You:" : ""}{" "}
            {conversation?.lastMessage?.text}{" "}
          </p>
        </div>
        <div className="flex flex-col justify-between items-end h-full">
          <p className={`text-sm text-text/70 whitespace-nowrap ${conversation?.unseenMessages > 0 ? "text-primary" : ''}`}>
            {`${
              conversation?.lastMessage?.createdAt
                .split("T")[1]
                .split(":")[0] > 12
                ? conversation?.lastMessage?.createdAt
                    .split("T")[1]
                    .split(":")[0] - 12
                : conversation?.lastMessage?.createdAt
                    .split("T")[1]
                    .split(":")[0]
            }:${
              conversation?.lastMessage?.createdAt.split("T")[1].split(":")[1]
            } ${
              conversation?.lastMessage?.createdAt
                .split("T")[1]
                .split(":")[0] >= 12
                ? "PM"
                : "AM"
            }`}
          </p>
          {conversation?.unseenMessages > 0 && (
            <div className="h-4 w-4 bg-primary rounded-full flex items-center justify-center text-sm">
              {conversation?.unseenMessages}
            </div>
          )}
        </div>
      </div>
  );
};

export default ChatUser;
