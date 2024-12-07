import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImFileEmpty, ImFileMusic, ImFileVideo } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import { RiLinksFill } from "react-icons/ri";
import Loader from "./Loader";
import { LuSend } from "react-icons/lu";
import { useSelector } from "react-redux";
import uploadToCloudinary from "../services/uploadToCloudinary";
import { addStatus } from "../services/UpdateServeces";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketProvider";
import { FaArrowLeft } from "react-icons/fa";

const AddStatus = () => {
  const [messageText, setMessageText] = useState("");
  const [fileSelected, setFileSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [btnBg, setBtnBg] = useState("bg-primary");
  const [fileDuration, setFileDuration] = useState(0)
  const userData = useSelector((state) => state.global.userData);
  const navigate = useNavigate();
  const socket = useSocket();
  const durationRef = useRef();

  useEffect(() => {
    if (durationRef.current) {
      // console.log("durationRef", durationRef.current);
      durationRef.current.addEventListener("loadedmetadata", () => {
        // console.log(durationRef.current.duration);
        setFileDuration(durationRef.current.duration)
      });
    }
  }, [durationRef.current, fileSelected]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;
    setFileSelected(selectedFile);

    // Generate preview for images
    // if (selectedFile.type.startsWith("image/")) {
    const filePreview = URL.createObjectURL(selectedFile);
    setFilePreview(filePreview);
    // } else {
    // For non-image files, reset the preview
    // setFilePreview(null);
    // }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (sendingUpdate) return;
    setSendingUpdate(true);
    // Send the update status to the server
    // ...

    const data = new FormData();
    data.append("file", fileSelected);

    const file = await uploadToCloudinary(data);
    // console.log(file);

    // console.log({
    //   userId: userData._id,
    //   file: file.path,
    //   message: messageText,
    // });

    const statusDetails = {
      user: userData._id,
      file: {
        fileType: fileSelected.type,
        fileUrl: file.path,
        fileDuration
      },
      message: messageText,
    };

    // const response = await addStatus({
    //   userId: userData._id,
    //   file: {
    //     fileType: fileSelected.type,
    //     fileUrl: file.path
    //   },
    //   message: messageText,
    // });
    // console.log("statusDetails", statusDetails);

    socket.emit("add_status", statusDetails);
    setSendingUpdate(false);
  };

  const handleAddStatus = useCallback((response) => {
    // console.log(response);

    if (response.success) {
      toast.success(response.message);

      setFileSelected(null);
      setFilePreview(null);
      setMessageText(null);
      navigate("/updates");
    } else {
      toast.error(response.message);
    }
  }, []);

  useEffect(() => {
    if(socket){
      socket.on("add_status", handleAddStatus);
      
      return () => {
        socket.off("add_status", handleAddStatus);
      };
    }

  }, [socket, handleAddStatus]);

  return (
    <div className="w-full h-full grid grid-rows-[60px_auto_50px] ">
      <div className="header bg-secondary shadow-md w-full flex gap-2 items-center p-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-surface hover:bg-background cursor-pointer rounded-full"
        >
          <FaArrowLeft size={20} className="text-text" />
        </button>
      </div>
      <div className="">
        {fileSelected ? (
          <div className="w-full h-full bg-secondary p-2">
            <div className="flex item-center justify-between">
              <div className=""></div>
              <button
                onClick={() => {
                  setFileSelected(null);
                  setFilePreview(null);
                }}
                className=" mb-2 hover:bg-background duration-100 p-1 rounded-full"
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="w-full relative h-[400px]">
              {fileSelected.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : fileSelected.type.startsWith("video/") ? (
                <video
                  ref={durationRef}
                  controls
                  width="500"
                  src={filePreview}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) :  fileSelected.type.startsWith("audio/") ? (
                <audio
                  ref={durationRef}
                  controls
                  src={filePreview}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className=" w-full h-full flex items-center justify-center">
            <h1 className="text-2xl capitalize font-semibold ">
              select file to update
            </h1>
          </div>
        )}
      </div>
      <div className="footer w-full mt-1">
        <form
          onSubmit={handleUpdateStatus}
          className="w-[80%] mx-auto flex gap-4 relative"
        >
          <div className="flex w-full rounded-md bg-secondary items-center px-2">
            <input
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
              // value={fileSelected}
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
              {sendingUpdate ? <Loader size={20} /> : <LuSend size={20} />}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStatus;
