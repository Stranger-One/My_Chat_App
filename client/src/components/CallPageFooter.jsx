import React from "react";
import { 
  IoMicOutline, 
  IoMicOffOutline, 
  IoVideocamOutline, 
  IoVideocamOffOutline,
  IoCall 
} from "react-icons/io5";
import { MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import { useMedia } from "../contexts/mediaProvider";

const CallPageFooter = ({ endCall, isVoiceOnly = false }) => {
  const {
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    isScreenSharing,
    toggleScreenShare,
  } = useMedia();

  return (
    <div className="w-full h-20 flex gap-4 items-center justify-center bg-black/40 backdrop-blur-md px-4 select-none">
      {/* Microphone Toggle */}
      <button
        type="button"
        onClick={toggleAudio}
        title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isAudioMuted
            ? "bg-rose-500 text-white shadow-lg"
            : "bg-white/15 hover:bg-white/25 text-white"
        }`}
      >
        {isAudioMuted ? <IoMicOffOutline size={22} /> : <IoMicOutline size={22} />}
      </button>

      {/* Video Toggle (Hidden if voice-only call) */}
      {!isVoiceOnly && (
        <button
          type="button"
          onClick={toggleVideo}
          title={isVideoMuted ? "Turn camera on" : "Turn camera off"}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isVideoMuted
              ? "bg-rose-500 text-white shadow-lg"
              : "bg-white/15 hover:bg-white/25 text-white"
          }`}
        >
          {isVideoMuted ? <IoVideocamOffOutline size={22} /> : <IoVideocamOutline size={22} />}
        </button>
      )}

      {/* Screen Share Toggle */}
      {!isVoiceOnly && (
        <button
          type="button"
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Stop screen sharing" : "Share screen"}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isScreenSharing
              ? "bg-wa-teal text-white shadow-lg"
              : "bg-white/15 hover:bg-white/25 text-white"
          }`}
        >
          {isScreenSharing ? (
            <MdOutlineStopScreenShare size={22} />
          ) : (
            <MdOutlineScreenShare size={22} />
          )}
        </button>
      )}

      {/* End Call Button */}
      <button
        type="button"
        onClick={endCall}
        title="End call"
        className="w-13 h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
      >
        <IoCall size={24} className="rotate-[135deg]" />
      </button>
    </div>
  );
};

export default CallPageFooter;
