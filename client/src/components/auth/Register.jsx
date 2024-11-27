import React, { useEffect, useState } from "react";
import axios from 'axios'
import Input from "../Input";
import Button from "../Button";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import Loader from "../Loader";
import { registerUser } from "../../services/authService.js";
import toast from "react-hot-toast";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [profile, setProfile] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate()

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: fullname,
      email: email,
      password,
      profilePic: profile,
    }
    // console.log("form data", data);
    const response = await registerUser(data)
    // console.log(response);
    if (response.success) {
      toast.success(response.message)

      setFullname('')
      setEmail('')
      setPassword('')
      setProfile('')
      setImageFile('')

      navigate('/auth/login')
    } else {
      toast.error(response.message)
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-secondary p-4 flex flex-col items-center text-text rounded-lg overflow-hidden"
    >
      <h2 className="text-3xl font-semibold ">Register</h2>
      <div className="h-fit">
        <label htmlFor="file" className="cursor-pointer p-1 ">
          <div className="w-16 h-16 bg-surface rounded-full overflow-hidden relative bg-cover border-[1px] border-background"
          style={{
            backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`
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
          type="text"
          name="fullname"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="Full Name"
          label="Full Name"
        />
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          label="Email"
        />
        <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          label="Password"
        />
      </div>
      <div className="w-full flex justify-end mt-4">
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </div>
      <p className="text-sm mt-2 font-semibold text-text/70">
        Already have an account{" "}
        <Link to="/auth/login" className="text-text hover:underline">
          Login{" "}
        </Link>
      </p>
    </form>
  );
};

export default Register;
