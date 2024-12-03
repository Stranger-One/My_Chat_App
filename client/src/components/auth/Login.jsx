import React, { useEffect, useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader";
import { loginUser, registerUser } from "../../services/authService.js";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import { useDispatch } from 'react-redux';
import { setIsAuthenticated, setUserData } from "../../store/authSlice.js";

const Login = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [loginResponse, setLoginResponse] = useState(null);
  const [slide, setSlide] = useState(1);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)

    const data = {
      email: email,
      password,
    };

    // console.log("form data", data);

    const response = await loginUser(data);
    // console.log(response);

    if (response.success) {
      toast.success(response.message);

      setLoginResponse(response);

      setFullname(response.user.name);
      setEmail(response.user.email);
      setProfile(response.user.profilePic);

      setSlide(2);
    } else {
      toast.error("Not recognize! Please check your Credential");
    }
    setLoading(false)
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // console.log(loginResponse);
    setLoading(true)

    // Set the token in a cookie
    // Cookies.set("token", loginResponse.token, { expires: 7 }); // Expires in 7 days
    sessionStorage.setItem("token", JSON.stringify(loginResponse.token))

    dispatch(setIsAuthenticated(true))
    dispatch(setUserData(loginResponse.user))

    toast.success("Login successfully.");

    setFullname("");
    setEmail("");
    setPassword("");
    setProfile("");

    navigate("/chat")
    setLoading(false)
    setSlide(1)
  };

  return (
    <div className="rounded-lg overflow-hidden">
      {slide === 1 && (
        <form
          onSubmit={handleLogin}
          className=" bg-secondary p-4 flex flex-col items-center gap-2 boxShadow text-text"
        >
          <h2 className="text-3xl font-semibold  ">Login</h2>
          <div className="flex flex-col gap-1">
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
              {loading ? <Loader /> : "Login"}
            </Button>
          </div>
          <p className="text-sm mt-2 font-semibold text-text/70">
            Already have an account{" "}
            <Link to="/auth/register" className="text-text hover:underline">
              Register{" "}
            </Link>
          </p>
        </form>
      )}

      {slide === 2 && (
        <form
          onSubmit={handleContinue}
          className=" bg-secondary p-4 flex flex-col items-center gap-2 min-w-[250px] boxShadow "
        >
          <div className="w-full ">
            <button onClick={() => setSlide(1)} className="w-9 h-9 rounded-full hover:bg-background duration-150 flex items-center justify-center">
              <FaArrowLeft />
            </button>
          </div>
          <div
            className="w-16 h-16 bg-surface rounded-full overflow-hidden relative bg-cover  border-[2px] border-background"
            style={{
              backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
            }}
          >
            <img src={profile} alt="" className="object-cover h-full" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold capitalize text-text">
              {fullname || "raj meher"}
            </h2>
            <h2 className="text-lg  text-text/70">
              {email || "rajmeher833@gmail.com"}
            </h2>
          </div>
          <div className="w-full flex justify-end mt-4">
            <Button type="submit" className="w-full">
              {loading ? <Loader/> : "Continue"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
