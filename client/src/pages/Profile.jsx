import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Loader } from "../components";
import { setIsAuthenticated, setUserData } from "../store/authSlice";
import { TbPencil } from "react-icons/tb";
import { FiCamera } from "react-icons/fi";
import { updateUser } from "../services/authService";
import toast from "react-hot-toast";
import uploadToCloudinary from "../services/uploadToCloudinary.js";
import axios from "axios";

const Profile = () => {
  const userData = useSelector((state) => state.auth.userData);
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
    sessionStorage.removeItem("token");
    dispatch(setIsAuthenticated(false));
    dispatch(setUserData(null));
    navigate("/");
  };

  const navigateToEdit = () => {
    // console.log("navigateToEdit")
    navigate("edit");
  };

  const uploadImageToCloudinary = async () => {
    try {
      console.log("Uploading to cloudinary...");
      setImageUploading(true);
      const data = new FormData();
      data.append("file", imageFile);

      const response = await uploadToCloudinary(data);

      if (response?.data?.success) {
        setProfile(response.data.file.path);
        console.log("response", response.data.file.path);
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
    console.log("response", response);
    if (response.success) {
      toast.success(response.message);
      dispatch(setUserData(response.user));
    } else {
      toast.error(response.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("selectedFile", selectedFile);
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
    setImageFile(null)
  };

  const handleSave = async () => {
    setLoading(true);
    let uploadedImageUrl=null;

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
          setImageFile(null)
          uploadedImageUrl = response.data.file.path;
        } else {
          console.log("Upload failed:", response);
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
    if(uploadedImageUrl){
      data.profilePic = uploadedImageUrl
    }

    console.log("finally", data);
    const response = await updateUser(data);
    // console.log("response", response);
    if (response.success) {
      toast.success(response.message);
      dispatch(setUserData(response.user));
    } else {
      toast.error(response.message);
    }
    setEnableAction(false)

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
    <div className="w-full h-full bg-cover bg-background text-text pt-20">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="">
          <label htmlFor="file" className="cursor-pointer p-1 ">
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

              {/* {imageUploading && (
                <div className="absolute top-0 left-0 w-full h-full bg-zinc-600 flex items-center justify-center">
                  <Loader />
                </div>
              )} */}
            </div>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file"
          />
        </div>
        {/* <div className="text-center">
          <h2 className="text-xl font-semibold capitalize leading-tight">
            {userData?.name || "Username"}
          </h2>
          <h2 className="text-lg text-text/70 font-semibold leading-tight">
            {userData?.email || "rajmeher833@gmail.com"}{" "}
          </h2>
          {userData?.verified ? (
            <h2 className="text-lg text-green-500 font-semibold">Verified</h2>
          ) : (
            <div className="">
              <h2 className="text-lg text-red-500 font-semibold">
                Your Email Is Not Verified
              </h2>
              <p className="text-red-400">
                <Link
                  to="verify-account"
                  className="text-blue-500 hover:underline"
                >
                  Verify
                </Link>{" "}
                to start messaging{" "}
              </p>
            </div>
          )}
        </div> */}
        <div className="flex flex-col gap-1 mt-4">
          <div className="flex items-center justify-start gap-2">
            <label htmlFor="email" className="text-xl font-semibold">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              readOnly
              className="bg-transparent border-none outline-none px-2 text-lg"
            />
          </div>
          <div className="flex items-center justify-start gap-2">
            <label htmlFor="fullname" className="text-xl font-semibold">
              Name:
            </label>
            <input
              ref={nameInputRef}
              type="text"
              name="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Username"
              readOnly={editName ? false : true}
              className="bg-transparent border-none outline-none px-2 text-lg"
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
        {/* <div className="flex gap-2 mt-10">
          <Button bg="bg-secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
