import React, { useState, useRef } from "react";
import { BsArrowLeft, BsImages } from "react-icons/bs";
import { IoSend, IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketProvider";
import axios from "axios";
import Loader from "./Loader";
import toast from "react-hot-toast";

const AddStatus = () => {
  const [caption, setCaption] = useState("");
  const [fileSelected, setFileSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const userData = useSelector((state) => state.global.userData);
  const navigate = useNavigate();
  const socket = useSocket();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileSelected(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileSelected && !caption.trim()) {
      toast.error("Please choose a file or enter text");
      return;
    }

    setUploading(true);
    let uploadedUrl = "";

    try {
      if (fileSelected) {
        const data = new FormData();
        data.append("file", fileSelected);
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          data
        );
        uploadedUrl = res.data?.file?.path || res.data?.url || "";
      }

      const statusDetails = {
        user: userData?._id,
        file: {
          fileType: fileSelected?.type || "text/plain",
          fileUrl: uploadedUrl,
          fileDuration: 5,
        },
        message: caption.trim(),
      };

      if (socket) {
        socket.emit("add_status", statusDetails);
        toast.success("Status added successfully!");
        navigate("/updates");
      }
    } catch (err) {
      console.error("Error adding status:", err);
      toast.error("Failed to add status");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-wa-bg-light dark:bg-wa-bg-dark text-wa-text-primary-light dark:text-wa-text-primary-dark select-none">
      {/* Header */}
      <div className="h-[60px] px-4 border-b border-wa-border-light dark:border-wa-border-dark flex items-center gap-3 bg-wa-header-light dark:bg-wa-header-dark">
        <button
          onClick={() => navigate("/updates")}
          className="p-2 rounded-full hover:bg-wa-surface text-wa-text-secondary-light dark:text-wa-text-secondary-dark"
        >
          <BsArrowLeft size={19} />
        </button>
        <h2 className="text-lg font-bold">New Status</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {filePreview ? (
          <div className="relative max-w-md w-full h-[360px] bg-black rounded-2xl overflow-hidden shadow-wa-modal flex items-center justify-center">
            <button
              onClick={() => {
                setFileSelected(null);
                setFilePreview(null);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 z-20"
            >
              <IoClose size={20} />
            </button>
            {fileSelected?.type?.includes("video") ? (
              <video src={filePreview} controls className="w-full h-full object-contain" />
            ) : (
              <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md h-64 border-2 border-dashed border-wa-border-light dark:border-wa-border-dark rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-wa-teal transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-wa-teal/10 text-wa-teal flex items-center justify-center">
              <BsImages size={28} />
            </div>
            <p className="font-semibold text-sm">Click to select photo or video</p>
            <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
              Upload from your device
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Caption & Send */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2 mt-6">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-11 h-11 rounded-full bg-wa-teal hover:bg-wa-teal-hover text-white flex items-center justify-center shadow-md flex-shrink-0"
          >
            {uploading ? <Loader size={20} /> : <IoSend size={18} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStatus;
