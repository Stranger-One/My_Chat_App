import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCamera } from "react-icons/fi";
import Loader from "../Loader";
import { registerUser } from "../../services/authService.js";
import toast from "react-hot-toast";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    let uploadedPicUrl = "";

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          formData
        );
        uploadedPicUrl = uploadRes.data?.file?.path || uploadRes.data?.url || "";
      }

      const response = await registerUser({
        name: fullname,
        email,
        password,
        profilePic: uploadedPicUrl || undefined,
      });

      if (response?.success) {
        toast.success("Account created successfully! Please log in.");
        navigate("/auth/login");
      } else {
        toast.error(response?.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-wa-text-primary-light dark:text-wa-text-primary-dark">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
        <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
          Join WhatsApp Web to start chatting with your friends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile Picture Avatar Upload */}
        <div className="flex flex-col items-center mb-1">
          <label htmlFor="register-photo" className="relative cursor-pointer group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-wa-border-light dark:border-wa-border-dark bg-wa-surface shadow-sm">
              <img
                src={profilePreview || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-wa-teal text-white flex items-center justify-center shadow-md">
              <FiCamera size={13} />
            </div>
          </label>
          <input
            id="register-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-[11px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-1">
            Optional profile photo
          </span>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark block mb-1.5">
            Full name
          </label>
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark block mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark block mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-wa-teal hover:bg-wa-teal-hover text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center mt-2"
        >
          {loading ? <Loader size={20} /> : "Register"}
        </button>

        <p className="text-center text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-2">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-wa-teal font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
