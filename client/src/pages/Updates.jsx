import React, { useEffect, useRef, useState, useCallback } from "react";
import { BsArrowLeft, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";

const Updates = () => {
  const allUserStatus = useSelector((state) => state.global.allUserStatus);
  const params = useParams();
  const navigate = useNavigate();

  const [curStatusUser, setCurStatusUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const DURATION_PER_STORY = 5000; // 5 seconds per story

  useEffect(() => {
    const foundUser = allUserStatus?.find(
      (u) => u.userDetails?._id === params.statusUserId
    );
    if (foundUser) {
      setCurStatusUser(foundUser);
      setCurrentIndex(0);
    }
  }, [params.statusUserId, allUserStatus]);

  const filesCount = curStatusUser?.files?.length || 0;

  const nextSlide = useCallback(() => {
    if (currentIndex < filesCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate("/updates");
    }
  }, [currentIndex, filesCount, navigate]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Auto progression
  useEffect(() => {
    if (isPaused || !filesCount) return;

    timerRef.current = setTimeout(() => {
      nextSlide();
    }, DURATION_PER_STORY);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, isPaused, filesCount, nextSlide]);

  if (!curStatusUser || !filesCount) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white select-none">
        <p className="text-sm text-zinc-400">Loading status...</p>
      </div>
    );
  }

  const currentFile = curStatusUser.files[currentIndex];

  return (
    <div
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="w-full h-full bg-zinc-950 text-white flex flex-col relative select-none overflow-hidden"
    >
      {/* Top Header & Segmented Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex flex-col gap-3">
        {/* Progress Segments */}
        <div className="w-full flex items-center gap-1.5">
          {curStatusUser.files.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all ${
                  idx < currentIndex
                    ? "w-full"
                    : idx === currentIndex
                    ? "w-full animate-progress"
                    : "w-0"
                }`}
                style={
                  idx === currentIndex
                    ? {
                        animation: `progress-animation ${DURATION_PER_STORY}ms linear`,
                        animationPlayState: isPaused ? "paused" : "running",
                      }
                    : {}
                }
              ></div>
            </div>
          ))}
        </div>

        {/* User Info & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/updates")}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <BsArrowLeft size={19} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40">
              <img
                src={curStatusUser.userDetails?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                alt={curStatusUser.userDetails?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold capitalize">
                {curStatusUser.userDetails?.name}
              </h3>
              <p className="text-[11px] text-zinc-300">
                {moment(currentFile?.createdAt).fromNow()}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/updates")}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>
      </div>

      {/* Media Viewer Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation Arrow Left */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <BsChevronLeft size={22} />
          </button>
        )}

        {/* Media content */}
        <div className="max-w-[85vw] max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl">
          {currentFile?.file?.fileType?.includes("image") ? (
            <img
              src={currentFile.file.fileUrl}
              alt="Status"
              className="max-h-[75vh] object-contain rounded-xl"
            />
          ) : currentFile?.file?.fileType?.includes("video") ? (
            <video
              src={currentFile.file.fileUrl}
              autoPlay
              controls
              className="max-h-[75vh] object-contain rounded-xl"
            />
          ) : (
            <div className="p-8 bg-zinc-800 rounded-xl text-center">
              <p>{currentFile?.message || "Status update"}</p>
            </div>
          )}
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <BsChevronRight size={22} />
        </button>
      </div>

      {/* Bottom Caption if available */}
      {currentFile?.message && (
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent text-center z-20">
          <p className="text-sm font-medium text-white max-w-lg mx-auto">
            {currentFile.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Updates;
