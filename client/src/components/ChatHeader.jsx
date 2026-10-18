import React, { useState } from "react";
import { IoVideocam, IoCall, IoSearch, IoClose } from "react-icons/io5";
import { BsThreeDotsVertical, BsArrowLeft } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineClear } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteConversation } from "../services/messageServices";
import { useSocket } from "../contexts/SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "./Loader";
import moment from "moment";
import {
  setCallAccepted,
  setCallActive,
  setCallDetails,
  setCallIncomming,
  setCallStatus,
  setCallType,
} from "../store/globalSlice";
import { useMedia } from "../contexts/mediaProvider";

const ChatHeader = ({ user, onlineUsers, onSearchToggle, searchQuery, setSearchQuery }) => {
  const userData = useSelector((state) => state.global.userData);
  const callActive = useSelector((state) => state.global.callActive);
  const typingUsers = useSelector((state) => state.global.typingUsers);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  const {
    peer,
    setRemotePeerId,
    setStream,
    myVideoRef,
    remoteVideoRef,
    startTimer,
    playRingtone,
  } = useMedia();

  const conversationId = location?.state?.conversationId;
  const isOnline = onlineUsers?.includes(user?._id);
  const isTyping = typingUsers?.[user?._id];

  const formatLastSeen = (time) => {
    if (!time) return "offline";
    const m = moment(time);
    const now = moment();
    if (now.isSame(m, "day")) {
      return `last seen today at ${m.format("hh:mm A")}`;
    }
    if (now.subtract(1, "day").isSame(m, "day")) {
      return `last seen yesterday at ${m.format("hh:mm A")}`;
    }
    return `last seen ${m.format("DD/MM/YYYY [at] hh:mm A")}`;
  };

  const handleStartCall = async (type = "video") => {
    if (!user || callActive) return;

    const callInfo = {
      callDate: moment().format("YYYY-MM-DD"),
      callTime: moment().format("hh:mm A"),
      callType: type,
      from: {
        name: userData.name,
        email: userData.email,
        profilePic: userData.profilePic,
        id: userData._id,
      },
      to: {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        id: user._id,
      },
    };

    dispatch(setCallDetails(callInfo));
    dispatch(setCallType(type));
    dispatch(setCallActive(true));
    dispatch(setCallStatus("Calling..."));

    // Play outgoing ringing sound
    playRingtone("outgoing");

    if (socket) {
      socket.emit("initiate_call", callInfo);
    }

    if (!peer) {
      toast.error("Call service connecting. Please try again in a moment.");
      return;
    }

    socket.emit("requestPeerId", user._id, async (response) => {
      if (response?.error) {
        toast.error(response.error);
        return;
      }

      const { peerId } = response;
      setRemotePeerId(peerId);

      try {
        const streamConstraints = {
          audio: true,
          video: type === "video",
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(streamConstraints);
        setStream(mediaStream);

        if (myVideoRef.current && type === "video") {
          myVideoRef.current.srcObject = mediaStream;
        }

        const outgoingCall = peer.call(peerId, mediaStream, {
          metadata: { callDetails: callInfo, callType: type },
        });

        outgoingCall?.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          dispatch(setCallIncomming(false));
          dispatch(setCallActive(true));
          dispatch(setCallAccepted(true));
          dispatch(setCallStatus("Connected"));
          startTimer();
        });
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
        toast.error("Unable to access microphone or camera.");
      }
    });
  };

  const handleDeleteConversation = async () => {
    setButtonLoading(true);
    try {
      if (conversationId) {
        const response = await deleteConversation(conversationId);
        if (response.success) {
          toast.success("Conversation deleted");
          navigate("/chat");
          if (socket && userData?._id) {
            socket.emit("request-all-conversation", userData._id);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting conversation", error);
      toast.error("Failed to delete conversation");
    } finally {
      setButtonLoading(false);
      setIsOpenMenu(false);
    }
  };

  return (
    <div className="h-[60px] w-full px-4 flex items-center justify-between bg-wa-header-light dark:bg-wa-header-dark border-b border-wa-border-light dark:border-wa-border-dark select-none z-30">
      {/* Left: Back (Mobile) & Contact Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/chat"
          className="md:hidden p-1.5 -ml-1 text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-surface rounded-full transition-colors"
          title="Back to chats"
        >
          <BsArrowLeft size={19} />
        </Link>

        <Link to="profile" className="flex items-center gap-3 min-w-0 group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src={user?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
              alt={user?.name}
              className="w-full h-full object-cover rounded-full"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-wa-badge border-2 border-white dark:border-wa-panel-dark rounded-full"></span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-wa-text-primary-light dark:text-wa-text-primary-dark truncate capitalize leading-tight group-hover:underline">
              {user?.name}
            </h2>
            <p className="text-[12px] truncate leading-tight">
              {isTyping ? (
                <span className="text-wa-teal dark:text-wa-green font-medium animate-pulse">
                  typing...
                </span>
              ) : isOnline ? (
                <span className="text-wa-teal dark:text-wa-green font-medium">
                  Online
                </span>
              ) : (
                <span className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
                  {formatLastSeen(user?.lastSeen)}
                </span>
              )}
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 text-wa-text-secondary-light dark:text-wa-text-secondary-dark relative">
        {/* Voice Call Button */}
        <button
          onClick={() => handleStartCall("voice")}
          disabled={callActive}
          title="Voice call"
          className={`p-2 rounded-full hover:bg-wa-surface transition-colors ${
            callActive ? "opacity-40 cursor-not-allowed" : "hover:text-wa-teal"
          }`}
        >
          <IoCall size={20} />
        </button>

        {/* Video Call Button */}
        <button
          onClick={() => handleStartCall("video")}
          disabled={callActive}
          title="Video call"
          className={`p-2 rounded-full hover:bg-wa-surface transition-colors ${
            callActive ? "opacity-40 cursor-not-allowed" : "hover:text-wa-teal"
          }`}
        >
          <IoVideocam size={22} />
        </button>

        {/* Search in chat toggle */}
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (onSearchToggle) onSearchToggle(!showSearch);
          }}
          title="Search in chat"
          className={`p-2 rounded-full hover:bg-wa-surface transition-colors ${
            showSearch ? "text-wa-teal bg-wa-surface" : ""
          }`}
        >
          <IoSearch size={20} />
        </button>

        {/* Three dots menu */}
        <button
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          title="More options"
          className="p-2 rounded-full hover:bg-wa-surface transition-colors"
        >
          <BsThreeDotsVertical size={19} />
        </button>

        {/* Dropdown Menu */}
        {isOpenMenu && (
          <div className="absolute top-12 right-0 w-52 bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark rounded-xl shadow-wa-dropdown py-1.5 z-50">
            <Link
              to="profile"
              onClick={() => setIsOpenMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors"
            >
              Contact info
            </Link>
            <button
              onClick={() => {
                setShowSearch(true);
                if (onSearchToggle) onSearchToggle(true);
                setIsOpenMenu(false);
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark hover:bg-wa-hover-light dark:hover:bg-wa-surface transition-colors"
            >
              Search messages
            </button>
            <button
              onClick={handleDeleteConversation}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <AiOutlineDelete size={17} />
              Delete chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
