import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData, setTheme, logout } from "../store/globalSlice";
import { TbPencil, TbCheck, TbCamera } from "react-icons/tb";
import { BsSunFill, BsMoonFill } from "react-icons/bs";
import { updateUser } from "../services/authService";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "../components/Loader";

const Profile = () => {
  const userData = useSelector((state) => state.global.userData);
  const theme = useSelector((state) => state.global.theme);
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setAbout(userData.about || "Hey there! I am using WhatsApp.");
    }
  }, [userData]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await updateUser({ email: userData.email, name: name.trim() });
      if (res.success) {
        dispatch(setUserData(res.user));
        toast.success("Name updated");
        setIsEditingName(false);
      }
    } catch (e) {
      toast.error("Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!about.trim()) {
      toast.error("About cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await updateUser({ email: userData.email, about: about.trim() });
      if (res.success) {
        dispatch(setUserData(res.user));
        toast.success("About updated");
        setIsEditingAbout(false);
      }
    } catch (e) {
      toast.error("Failed to update about");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
        data
      );
      const photoUrl = res.data?.file?.path || res.data?.url;
      if (photoUrl) {
        const updateRes = await updateUser({ email: userData.email, profilePic: photoUrl });
        if (updateRes.success) {
          dispatch(setUserData(updateRes.user));
          toast.success("Profile photo updated");
        }
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-6 bg-wa-panel-light dark:bg-wa-panel-dark text-wa-text-primary-light dark:text-wa-text-primary-dark select-none overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Profile Picture with hover overlay */}
        <div className="relative group my-4">
          <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-wa-border-light dark:border-wa-border-dark shadow-md">
            <img
              src={userData?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {uploadingImage ? (
              <Loader size={24} />
            ) : (
              <>
                <TbCamera size={26} className="mb-1" />
                <span className="text-[11px] font-semibold uppercase text-center px-2">
                  Change Profile Photo
                </span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Your Name Section */}
        <div className="w-full mt-6 p-4 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark">
          <label className="text-xs font-semibold text-wa-teal dark:text-wa-green uppercase tracking-wider block mb-1">
            Your name
          </label>
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-[15px] font-medium outline-none border-b border-wa-teal pb-0.5"
              />
            ) : (
              <p className="text-[15px] font-medium">{userData?.name || "Username"}</p>
            )}

            <button
              onClick={isEditingName ? handleSaveName : () => setIsEditingName(true)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-wa-text-secondary-light dark:text-wa-text-secondary-dark ml-2"
            >
              {isEditingName ? <TbCheck size={18} className="text-wa-teal" /> : <TbPencil size={18} />}
            </button>
          </div>
          <p className="text-[11px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-2 leading-relaxed">
            This is not your username or pin. This name will be visible to your WhatsApp contacts.
          </p>
        </div>

        {/* About Section */}
        <div className="w-full mt-4 p-4 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark">
          <label className="text-xs font-semibold text-wa-teal dark:text-wa-green uppercase tracking-wider block mb-1">
            About
          </label>
          <div className="flex items-center justify-between">
            {isEditingAbout ? (
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-[15px] font-medium outline-none border-b border-wa-teal pb-0.5"
              />
            ) : (
              <p className="text-[15px] font-medium text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
                {userData?.about || "Hey there! I am using WhatsApp."}
              </p>
            )}

            <button
              onClick={isEditingAbout ? handleSaveAbout : () => setIsEditingAbout(true)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-wa-text-secondary-light dark:text-wa-text-secondary-dark ml-2"
            >
              {isEditingAbout ? <TbCheck size={18} className="text-wa-teal" /> : <TbPencil size={18} />}
            </button>
          </div>
        </div>

        {/* Email Address Section */}
        <div className="w-full mt-4 p-4 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-wa-teal dark:text-wa-green uppercase tracking-wider block mb-1">
              Email
            </label>
            <p className="text-[14px] font-medium">{userData?.email}</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-wa-teal/10 text-wa-teal">
            Verified
          </span>
        </div>

        {/* Theme Settings Section */}
        <div className="w-full mt-4 p-4 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark">
          <label className="text-xs font-semibold text-wa-teal dark:text-wa-green uppercase tracking-wider block mb-2">
            Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => dispatch(setTheme("light"))}
              className={`p-2.5 rounded-xl flex items-center justify-center gap-2 border text-sm font-semibold transition-all ${
                theme === "light"
                  ? "border-wa-teal bg-wa-panel-light text-wa-teal shadow-sm"
                  : "border-transparent bg-black/5 dark:bg-white/5 opacity-70"
              }`}
            >
              <BsSunFill size={15} /> Light
            </button>
            <button
              onClick={() => dispatch(setTheme("dark"))}
              className={`p-2.5 rounded-xl flex items-center justify-center gap-2 border text-sm font-semibold transition-all ${
                theme === "dark"
                  ? "border-wa-teal bg-wa-panel-dark text-wa-teal shadow-sm"
                  : "border-transparent bg-black/5 dark:bg-white/5 opacity-70"
              }`}
            >
              <BsMoonFill size={14} /> Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
