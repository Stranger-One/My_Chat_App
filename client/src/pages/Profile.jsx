import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Loader } from "../components";
import { logout, setIsAuthenticated, setUserData } from "../store/globalSlice";
import { TbPencil } from "react-icons/tb";
import { FiCamera } from "react-icons/fi";
import { updateUser } from "../services/authService";
import toast from "react-hot-toast";
import uploadToCloudinary from "../services/uploadToCloudinary.js";
import axios from "axios";
import { TbLogout } from "react-icons/tb";

const Profile = () => {
  const userData = useSelector((state) => state.global.userData);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nameInputRef = useRef(null);
  const [enableAction, setEnableAction] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navigateToEdit = () => {
    // console.log("navigateToEdit")
    navigate("edit");
  };

  const uploadImageToCloudinary = async () => {
    try {
      // console.log("Uploading to cloudinary...");
      setImageUploading(true);
      const data = new FormData();
      data.append("file", imageFile);

      const response = await uploadToCloudinary(data);

      if (response?.data?.success) {
        setProfile(response.data.file.path);
        // console.log("response", response.data.file.path);
      } else {
        console.error(
          "Upload failed:",
          response?.data?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleUpdate = async () => {
    const data = {
      name: fullname,
      email: email,
      profilePic: profile,
    };
    // console.log("form data", data);
    const response = await updateUser(data);
    // console.log("response", response);
    if (response.success) {
      toast.success(response.message);
      dispatch(setUserData(response.user));
    } else {
      toast.error(response.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // console.log("selectedFile", selectedFile);
    if (!selectedFile) return;
    setImageFile(selectedFile);
    setEnableAction(true);
    const filePreview = URL.createObjectURL(selectedFile);
    setProfile(filePreview);
  };

  const handleEdit = () => {
    setEditName(true);
    setEnableAction(true);
    setTimeout(() => {
      nameInputRef.current?.focus(); // Set focus to the input field
    }, 0);
  };

  const handleCancle = () => {
    setFullname(userData.name);
    setEmail(userData.email);
    setProfile(userData.profilePic);
    setEnableAction(false);
    setEditName(false);
    setImageFile(null);
  };

  const handleSave = async () => {
    setLoading(true);
    let uploadedImageUrl = null;

    if (imageFile) {
      try {
        // console.log("Uploading to cloudinary...");
        const data = new FormData();
        data.append("file", imageFile);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
          data
        );

        // console.log("upload response", response.data.file.path);

        if (response.data.success) {
          setImageFile(null);
          uploadedImageUrl = response.data.file.path;
        } else {
          // console.log("Upload failed:", response);
        }
        // console.log("Uploading to cloudinary success...", {
        //   uploadedImageUrl
        // });
      } catch (error) {
        console.error("Error updating..", error);
      }
    }

    const data = {
      name: fullname,
      email: email,
    };
    if (uploadedImageUrl) {
      data.profilePic = uploadedImageUrl;
    }

    // console.log("finally", data);
    const response = await updateUser(data);
    // console.log("response", response);
    if (response.success) {
      toast.success(response.message);
      dispatch(setUserData(response.user));
    } else {
      toast.error(response.message);
    }
    setEnableAction(false);

    setLoading(false);
    setEditName(false);
  };

  useEffect(() => {
    if (userData) {
      setFullname(userData.name);
      setEmail(userData.email);
      setProfile(userData.profilePic);
    }
  }, [userData]);

  return (
    <div className="w-full h-full bg-cover bg-background text-text flex items-center justify-center pb-16">
      <div className="w-full h-full flex flex-col items-center justify-center  relative px-5 ">
        {/* Profile: */}
        <div className=" flex flex-col item-center justify-center">
          <label htmlFor="file" className="cursor-pointer p-1 mx-auto">
            <div
              className="w-32 h-32 bg-surface rounded-full relative bg-cover"
              style={{
                backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
              }}
            >
              <img
                src={profile}
                alt=""
                className="object-cover rounded-full h-full"
              />

              <div className="w-10 h-10 absolute bg-primary bottom-0 right-0 rounded-full flex items-center justify-center z-10">
                <FiCamera size={20} className="text-background" />
              </div>
            </div>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file"
          />
        </div>

        {/*  Email: and  Name: */}
        <div className="  mt-4 ">
          <div className="flex items-center justify-start gap-2 w-fit  mx-auto mt-2">
            <p className="text-xl w-full">
              <span className="text-xl font-semibold">Email:</span> {email}
            </p>
          </div>
          <div className=" w-fit mx-auto mt-2">
            <label htmlFor="fullname" className="text-xl font-semibold mr-2">
              Name:
            </label>
            <div className="inline-block">
              <input
                ref={nameInputRef}
                type="text"
                name="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Username"
                readOnly={editName ? false : true}
                className="bg-transparent border-none outline-none text-lg"
              />
              {!editName && (
                <button
                  onClick={handleEdit}
                  className="hover:bg-secondary duration-100 p-2 rounded-full "
                >
                  <TbPencil size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {enableAction && (
          <div className="flex gap-2 mt-10">
            <Button bg="bg-secondary" onClick={handleCancle}>
              Cancle
            </Button>
            <Button onClick={handleSave}>
              {loading ? <Loader /> : "Save"}
            </Button>
          </div>
        )}

        <div className=" absolute top-2 right-2">
          <button
            onClick={handleLogout}
            className="bg-secondary last:hover:brightness-90 p-2 rounded-lg"
          >
            <TbLogout size={24} className="text-text" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
