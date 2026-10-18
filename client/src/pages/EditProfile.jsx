import React, { useEffect, useState } from "react";
import { FiCamera } from "react-icons/fi";
import { Button, Input, Loader } from "../components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../services/authService";
import { setUserData } from "../store/globalSlice";
import toast from "react-hot-toast";

const EditProfile = () => {
  const userData = useSelector((state) => state.global.userData);
  const [fullname, setFullname] = useState(userData?.name || "");
  const [about, setAbout] = useState(userData?.about || "Hey there! I am using WhatsApp.");
  const [email, setEmail] = useState(userData?.email || "");
  const [profile, setProfile] = useState(userData?.profilePic || "");
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userData) {
      setFullname(userData.name || "");
      setAbout(userData.about || "Hey there! I am using WhatsApp.");
      setEmail(userData.email || "");
      setProfile(userData.profilePic || "");
    }
  }, [userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setProfile(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedPic = profile;
      if (imageFile) {
        setImageUploading(true);
        const data = new FormData();
        data.append("file", imageFile);
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          data
        );
        uploadedPic = res.data?.file?.path || res.data?.url || profile;
        setImageUploading(false);
      }

      const response = await updateUser({
        email,
        name: fullname.trim(),
        about: about.trim(),
        profilePic: uploadedPic,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        dispatch(setUserData(response.user));
        navigate("/profile");
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-wa-bg-light dark:bg-wa-bg-dark text-wa-text-primary-light dark:text-wa-text-primary-dark select-none">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-wa-panel-light dark:bg-wa-panel-dark border border-wa-border-light dark:border-wa-border-dark rounded-2xl shadow-wa-modal p-6 flex flex-col items-center gap-4"
      >
        <h2 className="text-2xl font-bold">Edit Profile</h2>

        <div className="relative group my-2">
          <label htmlFor="edit-profile-photo" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-wa-border-light dark:border-wa-border-dark bg-wa-surface shadow-md">
              <img src={profile} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-wa-teal text-white flex items-center justify-center shadow-lg">
              <FiCamera size={16} />
            </div>
          </label>
          <input
            id="edit-profile-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="w-full flex flex-col gap-3">
          <Input
            type="text"
            label="Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Your name"
            required
          />
          <Input
            type="text"
            label="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="About bio"
          />
          <Input
            type="email"
            label="Email"
            value={email}
            readOnly
            className="opacity-70 cursor-not-allowed"
          />
        </div>

        <div className="w-full flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex-1 py-2.5 rounded-xl border border-wa-border-light dark:border-wa-border-dark hover:bg-wa-surface font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <Button type="submit" className="flex-1">
            {loading || imageUploading ? <Loader size={20} /> : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
