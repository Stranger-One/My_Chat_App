import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useParams } from "react-router-dom";
import { getUser } from "../services/authService";

const ChatProfile = () => {
  const location = useLocation()
  const params = useParams();
  const [user, setUser] = useState(null);

  const getUserDetails = async () => {
    const response = await getUser(params.userId);
    // console.log(response);
    setUser(response.user);

  };

  useEffect(() => {
    getUserDetails();
  }, []);

  // console.log(location.pathname.replace('/profile', ''));
  return (
    <div className="w-full h-screen grid grid-rows-[60px_auto] bg-cover bg-black">
      <div className="chat-header bg-secondary shadow-md  w-full flex gap-2 items-center px-4">
        <Link
          to={location.pathname.replace('/profile', '')}
          className="p-2 bg-surface hover:bg-surface/70  cursor-pointer rounded-full"
        >
          <FaArrowLeft size={20} className="text-white" />
        </Link>
      </div>
      <div className="w-full bg-black flex flex-col items-center justify-center">
        <div
          className="w-20 h-20 bg-surface rounded-full overflow-hidden relative bg-cover"
          style={{
            backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
          }}
        >
          <img src={user?.profilePic} alt="" className="object-cover h-full" />
        </div>
        <div className="text-center">
          <h2 className="text-xl text-white font-semibold capitalize">
            { user?.name}
          </h2>
          <h2 className="text-lg text-white font-semibold">
            { user?.email}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ChatProfile;
