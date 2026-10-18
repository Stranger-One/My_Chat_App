import React, { useEffect, useState } from "react";
import { BsArrowLeft, BsTelephoneFill, BsCameraVideoFill } from "react-icons/bs";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";

const ChatProfile = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser(params.userId);
        if (response?.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    if (params.userId) {
      fetchUser();
    }
  }, [params.userId]);

  const backUrl = location.pathname.replace("/profile", "");

  return (
    <div className="w-full h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark text-wa-text-primary-light dark:text-wa-text-primary-dark select-none overflow-y-auto">
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center gap-3 bg-wa-header-light dark:bg-wa-header-dark border-b border-wa-border-light dark:border-wa-border-dark flex-shrink-0">
        <Link
          to={backUrl}
          className="p-2 rounded-full hover:bg-wa-surface text-wa-text-secondary-light dark:text-wa-text-secondary-dark transition-colors"
        >
          <BsArrowLeft size={19} />
        </Link>
        <h2 className="text-lg font-bold">Contact info</h2>
      </div>

      {/* Profile Card */}
      <div className="p-6 flex flex-col items-center border-b border-wa-border-light dark:border-wa-border-dark bg-wa-panel-light dark:bg-wa-panel-dark">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-2 border-wa-border-light dark:border-wa-border-dark mb-4">
          <img
            src={user?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold capitalize mb-1">{user?.name || "Contact"}</h2>
        <p className="text-sm text-wa-text-secondary-light dark:text-wa-text-secondary-dark">{user?.email}</p>

        {/* Quick Call Actions */}
        <div className="flex items-center gap-6 mt-5">
          <button
            onClick={() => navigate(backUrl)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-wa-surface text-wa-teal transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-wa-teal/10 flex items-center justify-center">
              <BsTelephoneFill size={18} />
            </div>
            <span className="text-xs font-semibold">Audio</span>
          </button>

          <button
            onClick={() => navigate(backUrl)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-wa-surface text-wa-teal transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-wa-teal/10 flex items-center justify-center">
              <BsCameraVideoFill size={19} />
            </div>
            <span className="text-xs font-semibold">Video</span>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 mx-4 my-4 rounded-2xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark">
        <span className="text-xs font-semibold text-wa-teal dark:text-wa-green uppercase tracking-wider block mb-1">
          About
        </span>
        <p className="text-sm font-medium leading-relaxed">
          {user?.about || "Hey there! I am using WhatsApp."}
        </p>
      </div>

      {/* Encryption Banner */}
      <div className="p-4 mx-4 rounded-2xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark leading-relaxed">
        <p className="font-semibold text-wa-text-primary-light dark:text-wa-text-primary-dark mb-1">
          🔒 Encryption
        </p>
        <p>Messages and calls are end-to-end encrypted. Tap to verify.</p>
      </div>
    </div>
  );
};

export default ChatProfile;
