import React, { useEffect, useRef, useState, useCallback } from "react";
import { BsEmojiSmile, BsPaperclip, BsFillImageFill, BsFileEarmarkTextFill, BsTrashFill } from "react-icons/bs";
import { IoSend, IoClose } from "react-icons/io5";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../contexts/SocketProvider";
import { setReplyingToMessage } from "../store/globalSlice";
import SelectedFillePreview from "./SelectedFillePreview";
import Loader from "./Loader";
import axios from "axios";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ChatInputFooter = () => {
  const userData = useSelector((state) => state.global.userData);
  const replyingToMessage = useSelector((state) => state.global.replyingToMessage);
  const socket = useSocket();
  const params = useParams();
  const dispatch = useDispatch();

  const [textMessage, setTextMessage] = useState("");
  const [fileSelected, setFileSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // Voice recording state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleInputChange = (e) => {
    setTextMessage(e.target.value);
    if (socket && params?.userId && userData?._id) {
      socket.emit("typing", { senderId: userData._id, receiverId: params.userId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { senderId: userData._id, receiverId: params.userId });
      }, 1500);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFileSelected(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setFilePreview(preview);
    setShowAttachMenu(false);
  };

  const handleEmojiSelect = (emoji) => {
    setTextMessage((prev) => prev + emoji.native);
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm; codecs=opus",
        });
        setVoiceBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Could not access microphone");
    }
  };

  // Stop recording
  const stopRecording = (shouldDiscard = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (shouldDiscard) {
        setVoiceBlob(null);
        setRecordingDuration(0);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!textMessage.trim() && !fileSelected && !voiceBlob && !isRecording) return;

    // If still recording, stop and let blob set
    if (isRecording) {
      stopRecording(false);
      return;
    }

    setSendingMessage(true);
    let uploadedFileUrl = "";

    try {
      // 1. Upload voice note if present
      if (voiceBlob) {
        const dataForm = new FormData();
        dataForm.append("file", voiceBlob, `voice-${Date.now()}.webm`);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          dataForm
        );
        uploadedFileUrl = response.data?.file?.path || response.data?.url || "";
      } else if (fileSelected) {
        // 2. Upload file if present
        const dataForm = new FormData();
        dataForm.append("file", fileSelected);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          dataForm
        );
        uploadedFileUrl = response.data?.file?.path || response.data?.url || "";
      }

      // 3. Emit message
      if (socket && (textMessage.trim() || uploadedFileUrl)) {
        socket.emit("send-message", {
          text: textMessage.trim(),
          sender: userData._id,
          receiver: params.userId,
          replyTo: replyingToMessage?._id || null,
          file: {
            fileName: fileSelected ? fileSelected.name : voiceBlob ? "Voice note.webm" : "",
            fileType: fileSelected
              ? fileSelected.type
              : voiceBlob
              ? "audio/webm"
              : "",
            fileUrl: uploadedFileUrl,
            fileSize: fileSelected ? fileSelected.size : voiceBlob ? voiceBlob.size : 0,
          },
        });

        // Clear reply, inputs, and timer
        dispatch(setReplyingToMessage(null));
        setTextMessage("");
        setFileSelected(null);
        setFilePreview(null);
        setVoiceBlob(null);
        setRecordingDuration(0);
        setShowEmojiPicker(false);

        // Emit stop-typing
        socket.emit("stop-typing", { senderId: userData._id, receiverId: params.userId });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full bg-wa-header-light dark:bg-wa-header-dark border-t border-wa-border-light dark:border-wa-border-dark flex flex-col relative z-20">
      {/* File Preview */}
      <SelectedFillePreview
        fileSelected={fileSelected}
        filePreview={filePreview}
        setFileSelected={setFileSelected}
      />

      {/* Quoted Reply Preview Bar */}
      {replyingToMessage && (
        <div className="px-4 py-2 bg-wa-panel-light dark:bg-wa-panel-dark border-b border-wa-border-light dark:border-wa-border-dark flex items-center justify-between">
          <div className="border-l-4 border-wa-teal pl-3 py-0.5 text-xs min-w-0">
            <p className="font-semibold text-wa-teal truncate">
              Replying to {replyingToMessage.sender === userData?._id ? "yourself" : "contact"}
            </p>
            <p className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark truncate">
              {replyingToMessage.text || (replyingToMessage.file?.fileUrl ? "Media" : "Message")}
            </p>
          </div>
          <button
            onClick={() => dispatch(setReplyingToMessage(null))}
            className="p-1 rounded-full hover:bg-wa-surface text-wa-text-secondary-light dark:text-wa-text-secondary-dark"
          >
            <IoClose size={18} />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-3 z-50 shadow-wa-modal rounded-xl overflow-hidden">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" />
        </div>
      )}

      {/* Attachments Dropdown Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-16 left-12 bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark rounded-2xl shadow-wa-dropdown p-2 flex flex-col gap-1 z-40">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-wa-hover-light dark:hover:bg-wa-surface text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center">
              <BsFillImageFill size={15} />
            </div>
            Photos & Videos
          </button>
          <button
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-wa-hover-light dark:hover:bg-wa-surface text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
              <BsFileEarmarkTextFill size={15} />
            </div>
            Document
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={docInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Footer Main Input Area */}
      <div className="h-[62px] px-3 flex items-center gap-2">
        {isRecording ? (
          // Recording in Progress Mode
          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-wa-panel-light dark:bg-wa-panel-dark rounded-xl border border-wa-border-light dark:border-wa-border-dark">
            <div className="flex items-center gap-2 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-semibold text-sm">Recording audio</span>
              <span className="text-xs font-mono ml-2 text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
                {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stopRecording(true)}
                className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500"
                title="Discard recording"
              >
                <BsTrashFill size={17} />
              </button>
              <button
                type="button"
                onClick={() => stopRecording(false)}
                className="p-1.5 rounded-full bg-wa-teal text-white"
                title="Stop & prepare send"
              >
                <FaStop size={14} />
              </button>
            </div>
          </div>
        ) : (
          // Standard Text Input Mode
          <div className="flex-1 flex items-center gap-2 bg-wa-panel-light dark:bg-wa-panel-dark rounded-xl px-3 py-1.5 border border-wa-border-light dark:border-wa-border-dark">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:text-wa-teal transition-colors"
              title="Emoji"
            >
              <BsEmojiSmile size={21} />
            </button>

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:text-wa-teal transition-colors"
              title="Attach"
            >
              <BsPaperclip size={23} />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={textMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              className="w-full bg-transparent text-[15px] text-wa-text-primary-light dark:text-wa-text-primary-dark placeholder:text-wa-text-secondary-light dark:placeholder:text-wa-text-secondary-dark outline-none"
            />
          </div>
        )}

        {/* Action Button: Send OR Record Voice Note */}
        {textMessage.trim() || fileSelected || voiceBlob ? (
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={sendingMessage}
            className="w-11 h-11 rounded-full bg-wa-teal hover:bg-wa-teal-hover text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 flex-shrink-0"
            title="Send"
          >
            {sendingMessage ? <Loader size={20} /> : <IoSend size={18} className="ml-0.5" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={isRecording ? () => stopRecording(false) : startRecording}
            className="w-11 h-11 rounded-full bg-wa-teal hover:bg-wa-teal-hover text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 flex-shrink-0"
            title="Record voice message"
          >
            <FaMicrophone size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInputFooter;
