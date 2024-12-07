import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from "react-icons/io";
import {
  IoCallOutline,
  IoClose,
  IoStarOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteConversation } from "../services/messageServices";
import { useSocket } from "../contexts/SocketProvider";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "./Loader";
import {
  setCallAccepted,
  setCallActive,
  setCallDetails,
  setCallIncomming,
} from "../store/globalSlice";
import moment from "moment";
import { useMedia } from "../contexts/mediaProvider";
import Peer from "peerjs";

const ChatHeader = ({ user, onlineUsers }) => {
  const userData = useSelector((state) => state.global.userData);
  const callActive = useSelector((state) => state.global.callActive);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();
  const conversationId = location?.state?.conversationId;
  const {peer, setPeer, myPeerId, setMyPeerId, remotePeerId, setRemotePeerId, stream, setStream, call, setCall, myVideoRef, remoteVideoRef } = useMedia()
  // console.log("user", user);

  // console.log("moment", moment().format("MM/DD/YYYY [at] hh:mm A"));
  const date = moment().format("DD/MM/YYYY");
  const time = moment().format("hh:mm A");

  const outgoingCallDetails = {
    call: "outgoing",
    callType: "", // voice / video
    callDate: date,
    callTime: time,
    to: {
      name: user.name,
      email: user.email,
      prifilePic: user.profilePic,
      id: user._id,
    },
    from: {
      name: userData.name,
      email: userData.email,
      prifilePic: userData.profilePic,
      id: userData._id,
    },
  };

  const handleVoiceCall = () => {
    // console.log("voice call initiating...");
    dispatch(setCallActive(true));

    const details = {
      ...outgoingCallDetails,
      callType: "voice",
    };
    dispatch(setCallDetails(details));

    socket.emit("initiate_call", details);
  };

  // const handleVideoCall = () => {
  //   console.log("Video Call initiating...");
  //   dispatch(setCallActive(true));

  //   const details = {
  //     ...outgoingCallDetails,
  //     callType: "video",
  //   };
  //   dispatch(setCallDetails(details));

  //   socket.emit("initiate_call", details);
  // };

  const handleVideoCall = () => {
    socket.emit("requestPeerId", user._id, (response) => { // Replace "user2" with dynamic user ID
      if (response.error) {
        alert(response.error);
        return;
      }
      // console.log("Call initiating...");
      dispatch(setCallActive(true));

      const details = {
        ...outgoingCallDetails,
        callType: "video",
      };
      dispatch(setCallDetails(details));
      socket.emit("initiate_call", details);

      const { peerId } = response;
      setRemotePeerId(peerId);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
        myVideoRef.current.srcObject = stream;
        const outgoingCall = peer.call(peerId, stream);

        outgoingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        setCall(outgoingCall);
      });
    });
  };

  const handleThreeDot = () => {
    setIsOpenMenu((menu) => !menu);
    setIsSearchOpen(false);
  };


  const linkList = [
    // {
    //   path: "",
    //   icon: IoStarOutline,
    //   onclick: startCall,
    // },
    // {
    //   path: "",
    //   icon: IoCallOutline,
    //   onclick: handleVoiceCall,
    //   disabled: callActive ? true : false,
    // },
    {
      path: "",
      icon: IoVideocamOutline,
      onclick: handleVideoCall,
      disabled: callActive ? true : false,
    },
    {
      path: "",
      icon: BsThreeDotsVertical,
      onclick: handleThreeDot,
      disabled: false,
    },
  ];

  const handleDeleteConversation = async () => {
    setButtonLoading(true);
    const response = await deleteConversation(conversationId);
    // console.log("delete response", response);
    navigate("/chat");
    if (socket && response.success) {
      toast.success(response.message);
      socket.emit("request-all-conversation", userData?._id);
    }
    setButtonLoading(false);
  };

  return (
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
              onlineUsers?.includes(user._id) ? "text-text" : "text-text/70"
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
            disabled={link.disabled}
            className={`p-[6px] bg-surface hover:bg-text hover:text-background duration-150 flex items-center justify-center w-fit rounded-full cursor-pointer ${
              link.disabled ? " bg-text/40" : " "
            } `}
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
  );
};

export default ChatHeader;
