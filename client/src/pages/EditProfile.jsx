import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button, Input, Loader } from "../components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../services/authService";
import { setUserData } from "../store/globalSlice";
import toast from "react-hot-toast";

const EditProfile = () => {
  const userData = useSelector((state) => state.global.userData);
  const [fullname, setFullname] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [profile, setProfile] = useState(userData.profilePic);
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const uploadImageToCloudinary = async () => {
    try {
      setImageUploading(true);
      const data = new FormData();
      data.append("file", imageFile);

      // console.log("data", data);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload/upload-media`,
        data
      );

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

  useEffect(() => {
    if (imageFile) {
      uploadImageToCloudinary();
    }
  }, [imageFile]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const data = {
      name: fullname,
      email: email,
      profilePic: profile,
    };
    // console.log("form data", data);
    const response = await updateUser(data);
    // console.log(response);
    if (response.success) {
      toast.success(response.message);
      dispatch(setUserData(response.user));

      // setFullname('')
      // setEmail('')
      // setPassword('')
      // setProfile('')
      // setImageFile('')

      navigate("/profile");
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <form
        onSubmit={handleUpdate}
        className=" bg-secondary text-text p-4 flex flex-col items-center gap-2 min-w-[300px] "
      >
        <h2 className="text-3xl font-semibold ">Edit Your Profile</h2>
        <div className="">
          <label htmlFor="file" className="cursor-pointer p-1 ">
            <div
              className="w-16 h-16 bg-surface rounded-full overflow-hidden relative bg-cover"
              style={{
                backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
              }}
            >
              <img src={profile} alt="" className="object-cover h-full" />
              {!imageFile && (
                <div className="absolute bottom-0 left-0 w-full flex items-center justify-center h-4 bg-surface">
                  <FaPlus className="text-background" />
                </div>
              )}
              {imageUploading && (
                <div className="absolute top-0 left-0 w-full h-full bg-zinc-600 flex items-center justify-center">
                  <Loader />
                </div>
              )}
            </div>
          </label>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="hidden"
            id="file"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            label="Email"
            readOnly
          />
          <Input
            type="text"
            name="fullname"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Full Name"
            label="Full Name"
          />
          {/* <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          label="Password"
        /> */}
        </div>
        <div className="w-full flex justify-end mt-4">
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
