import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { RiLinksFill } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../components";
import { LuSend } from "react-icons/lu";
import { useSelector } from "react-redux";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const Updates = () => {
  const [messageText, setMessageText] = useState("");
  const [btnBg, setBtnBg] = useState("bg-primary");
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const allUserStatus = useSelector((state) => state.auth.allUserStatus);
  const params = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [curStatusUser, setCurStatusUser] = useState();
  const [curStatusDelay, setCurStatusDelay] = useState(10000)
  const durationRef = useRef()
  const timeoutRef = useRef(null);

  useEffect(()=>{
    const duration = curStatusUser?.files[currentIndex]?.file?.fileDuration
    if(duration){
      const animationDuration = Number((duration * 1000).toFixed(0))
      
      console.log('duration', animationDuration);
      setCurStatusDelay(animationDuration)
      document.documentElement.style.setProperty("--animationDuration", `${animationDuration}ms`);
    }
  }, [currentIndex, curStatusUser])

  const autoNavigate = useCallback(() => {
    if (currentIndex == curStatusUser?.count - 1) {
      const duration = curStatusUser?.files[currentIndex]?.file?.fileDuration
      const animationDuration = Number((duration * 1000).toFixed(0))
      timeoutRef.current = setTimeout(() => {
        navigate("/updates");
      }, animationDuration);
    } 
    console.log("currentIndex", currentIndex);
  }, [params.statusUserId, currentIndex, curStatusUser]);

  useEffect(() => {
    autoNavigate();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [params.statusUserId, currentIndex, curStatusUser]);

  useEffect(() => {
    const statusUser = allUserStatus.find(
      (user) => user.userDetails._id === params.statusUserId
    );
    // console.log(statusUser);
    setCurStatusUser(statusUser);
  }, [params.statusUserId]);

  return (
    <div className="w-full h-full grid grid-rows-[60px_auto_50px] ">
      <div className="header w-full flex gap-2 items-center p-3">
        <button
          onClick={() => navigate("/updates")}
          className="p-2 bg-surface hover:bg-secondary cursor-pointer rounded-full"
        >
          <FaArrowLeft size={20} className="text-text" />
        </button>
        <div className="flex flex-col gap-1 w-full ">
          <div className="progress-container">
            {curStatusUser?.files.map((_, idx) => (
              <div
                key={idx}
                className={`progress-bar flex-1 h-1 bg-secondary rounded-sm overflow-hidden relative ${
                  currentIndex == idx
                    ? "current"
                    : currentIndex > idx
                    ? "completed"
                    : ""
                }`}
                style={{
                  animationDuration: `${curStatusDelay}ms`,
                }}
              ></div>
            ))}
          </div>
          <div className="flex gap-2">
            <div
              className="w-10 h-10 bg-surface rounded-full bg-cover overflow-hidden"
              style={{
                backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
              }}
            >
              <img
                src={curStatusUser?.userDetails?.profilePic}
                alt=""
                className="object-cover h-full w-full object-center"
              />
            </div>

            <div className="">
              <h2 className="user-name line-clamp-1 font-semibold capitalize leading-4">
                {curStatusUser?.userDetails?.name}
              </h2>
              <p className={`line-clamp-1 leading-5 font-semibold text-sm `}>
                {curStatusUser?.files[currentIndex]?.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=" px-10 py-5  flex items-center">
        <div className="w-full ">
          <Swiper
            key={curStatusUser}
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            autoplay={{
              delay: curStatusDelay, // Each status lasts for 5 seconds
              disableOnInteraction: false,
            }}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.activeIndex);
            }}
            className="w-[60vw] p-2"
          >
            {curStatusUser?.files?.map((status, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center "
              >
                <div className=" h-[60vh] w-[60vw] ">
                  {status.file.fileType.startsWith("image/") ? (
                    <img
                      src={status.file.fileUrl}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : status.file.fileType.startsWith("video/") ? (
                    <video ref={durationRef}
                      controls
                      width="full"
                      src={status.file.fileUrl}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : status.file.fileType.startsWith("audio/") ? (
                    <audio ref={durationRef}
                      controls
                      src={status.file.fileUrl}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : null}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="footer w-full mt-1">
        <form
          // onSubmit={handleUpdateStatus}
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

export default Updates;
