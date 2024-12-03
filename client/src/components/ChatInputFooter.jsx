import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { RiLinksFill } from "react-icons/ri";
import { LuSend } from "react-icons/lu";
import { FaStop } from "react-icons/fa";
import { MdMicNone } from "react-icons/md";
import { useSelector } from "react-redux";
import { useSocket } from "../contexts/SocketProvider";
import SelectedFillePreview from "./SelectedFillePreview";
import Loader from "./Loader";
import axios from "axios";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useParams } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import WaveSurfer from "wavesurfer.js";
import { IoPlay } from "react-icons/io5";
import { IoPause } from "react-icons/io5";

const ChatInputFooter = () => {
  const userData = useSelector((state) => state.auth.userData);
  const socket = useSocket();
  const params = useParams();
  const [TextMessage, setTextMessage] = useState("");
  const [btnBg, setBtnBg] = useState("bg-primary");
  const [fileSelected, setFileSelected] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceMessageDuration, setVoiceMessageDuration] = useState(0);
  const [playingVoiceMessage, setPlayingVoiceMessage] = useState(false);

  const [voiceMsgPlayingDuration, setVoiceMsgPlayingDuration] = useState(0);
  const audioTagRef = useRef();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/ogg; codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      //   const audio = new Audio(url)
      //   setRecordedVoiceMessage(audio)
      //   console.log("url", url);
      setVoiceBlob(audioBlob);
      setVoiceMessage(url);
      // You can send the audioBlob to the server here.
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setVoiceMessageDuration(0);
    // console.log("start recording");
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingDuration(0);
    // console.log("stop recording: voice message", voiceMessage);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // console.log("selectedFile", selectedFile);
    if (!selectedFile) return;
    setFileSelected(selectedFile);
    const filePreview = URL.createObjectURL(selectedFile);
    setFilePreview(filePreview);
  };

  const handleEmojiSelect = (emoji) => {
    console.log("emoji", emoji);
    setTextMessage((prevMessage) => prevMessage + emoji.native);
    setShowEmojiPicker(false); // Hide picker after selection
  };

  // emit send message event
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    let fileUrl = "";

    if (voiceMessage && voiceBlob) {
      try {
        const data = new FormData();
        data.append("file", voiceBlob);
        // console.log("data", data);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          data
        );
        // console.log(response);
        fileUrl = response.data.file.path;
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    if (fileSelected) {
      try {
        const data = new FormData();
        data.append("file", fileSelected);
        // console.log("data", data);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          data
        );
        fileUrl = response.data.file.path;
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    try {
      if (TextMessage || voiceMessage || fileSelected) {
        socket.emit("send-message", {
          text: TextMessage,
          sender: userData._id,
          receiver: params.userId,
          file: {
            fileName: fileSelected ? fileSelected?.name : "",
            fileType: fileSelected
              ? fileSelected?.type
              : voiceBlob
              ? voiceBlob.type
              : "",
            fileUrl: fileUrl,
            fileSize: fileSelected ? fileSelected?.size : "",
          },
        });

        // console.log("emit", {
        //   text: TextMessage,
        //   sender: userData._id,
        //   receiver: params.userId,
        //   file: {
        //     fileName: fileSelected ? fileSelected?.name : "",
        //     fileType: fileSelected
        //       ? fileSelected?.type
        //       : voiceBlob
        //       ? voiceBlob.type
        //       : "",
        //     fileUrl: fileUrl,
        //     fileSize: fileSelected ? fileSelected?.size : "",
        //   },
        // });
        setTextMessage("");
        setFileSelected(null);

        setVoiceBlob(null);
        setVoiceMessage(null);
        setRecordingDuration(null);
        setVoiceMessageDuration(0);
      }
      //   if(voiceMessage && voiceBlob){

      //   }
    } catch (error) {
      console.error(error);

      setSendingMessage(false);
    }

    setSendingMessage(false);
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        setVoiceMessageDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const updateVoiceMessageDuration = useCallback(() => {
    const seconds = Math.floor(audioTagRef.current.currentTime);

    if (voiceMsgPlayingDuration != seconds) {
      setVoiceMsgPlayingDuration(seconds);
      //   console.log("timeupdate", seconds);
    }
    if (voiceMessageDuration == seconds) {
      // setVoiceMsgPlayingDuration(0)
      setPlayingVoiceMessage(false);
    }
  }, [audioTagRef.current]);

  useEffect(() => {
    const audioElement = audioTagRef.current;

    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateVoiceMessageDuration);

      // Cleanup function
      return () => {
        audioElement.removeEventListener(
          "timeupdate",
          updateVoiceMessageDuration
        );
      };
    }
  }, [audioTagRef, updateVoiceMessageDuration]);

  const handlePlayPause = () => {
    if (playingVoiceMessage) {
      pauseVoiceMessage();
    } else {
      playVoiceMessage();
    }
    setPlayingVoiceMessage((state) => !state);
  };

  const playVoiceMessage = () => {
    console.log("playing....");
    audioTagRef.current.play();
  };
  const pauseVoiceMessage = () => {
    console.log("pause....");
    audioTagRef.current.pause();
  };

  return (
    <div className=" w-full h-full flex items-center justify-center ">
      <form
        onSubmit={handleSendMessage}
        className="w-[80%] flex gap-4 relative "
      >
        {/* Preview of selected file */}
        <SelectedFillePreview
          fileSelected={fileSelected}
          filePreview={filePreview}
          setFileSelected={setFileSelected}
        />

        {showEmojiPicker && (
          <div className=" absolute bottom-14 left-0">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}

        {/* {voiceMessage && (
          <div className="absolute bottom-12 left-0 rounded-t-lg p-2">
            <h3>Playback:</h3>
            <audio controls src={voiceMessage}></audio>
          </div>
        )} */}

        {isRecording || voiceMessage ? (
          <div className="flex gap-2 w-full rounded-md bg-secondary items-center px-2">
            <div className="w-full h-full">
              {isRecording ? (
                <div className="flex h-full gap-2 items-center">
                  <MdMicNone size={20} />
                  <h3 className="text-red-800 animate-pulse text-lg">
                    Recording...
                  </h3>
                  <p className="text-red-800 font-semibold">
                    {" "}
                    {recordingDuration}s
                  </p>
                </div>
              ) : (
                <div className="flex items-center w-full h-full gap-2">
                  <button onClick={handlePlayPause}>
                    {playingVoiceMessage ? (
                      <IoPause size={20} />
                    ) : (
                      <IoPlay size={20} />
                    )}
                  </button>
                  <p>
                    {(voiceMsgPlayingDuration / 60).toFixed(0)}:
                    {voiceMsgPlayingDuration % 60 < 10
                      ? `0${voiceMsgPlayingDuration % 60}`
                      : voiceMsgPlayingDuration % 60}
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={voiceMessageDuration}
                    value={voiceMsgPlayingDuration}
                    onChange={(e) => setVoiceMsgPlayingDuration(e.target.value)}
                  />
                  {/* <p>{voiceMessageDuration}</p> */}
                  <p>
                    {(voiceMessageDuration / 60).toFixed(0)}:
                    {voiceMessageDuration % 60 < 10
                      ? `0${voiceMessageDuration % 60}`
                      : voiceMessageDuration % 60}
                  </p>
                  <audio
                    controls
                    ref={audioTagRef}
                    src={voiceMessage}
                    className="absolute bottom-20 left-0 hidden"
                  ></audio>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setVoiceMessage(null);
                setVoiceBlob(null)
                setVoiceMessage(null)
              }}
              className="p-2 hover:bg-background rounded-md"
            >
              <AiOutlineDelete size={20} />
            </button>
          </div>
        ) : (
          <div className="flex w-full rounded-md bg-secondary items-center px-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((state) => !state)}
              className="px-2"
            >
              <BsEmojiSmile size={20} />
            </button>
            <input
              disabled={!userData?.verified}
              type="text"
              value={TextMessage}
              onChange={(e) => setTextMessage(e.target.value)}
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
        )}

        {TextMessage || voiceMessage || fileSelected ? (
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
        ) : (
          <button
            type="button"
            className="bg-primary/60 p-1 rounded-full hover:rounded-lg duration-150"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <div
              onMouseDown={() => setBtnBg("bg-primary/60")}
              onMouseUp={() => setBtnBg("bg-primary")}
              className={`${btnBg} p-2 rounded-full hover:rounded-lg duration-150`}
            >
              {sendingMessage ? (
                <Loader size={20} />
              ) : isRecording ? (
                <FaStop size={20} />
              ) : (
                <MdMicNone size={20} />
              )}
            </div>
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInputFooter;
