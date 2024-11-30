import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components";
import {
  setIsAuthenticated,
  setUserData,
} from "../store/authSlice";

const Profile = () => {
  const location = useLocation();
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch(setIsAuthenticated(false));
    dispatch(setUserData(null));
    navigate("/");
  };

  const navigateToEdit = () => {
    // console.log("navigateToEdit")
    navigate("edit")
  };

  return (
    <div className="w-full h-full bg-cover bg-background text-text pt-20">
      <div className="w-full flex flex-col items-center justify-center">
        <div
          className="w-20 h-20 bg-surface rounded-full overflow-hidden relative bg-cover"
          style={{
            backgroundImage: `url(https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png)`,
          }}
        >
          <img
            src={userData?.profilePic}
            alt=""
            className="object-cover h-full"
          />
        </div>
        <div className="text-center">
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
        </div>
        <div className="flex gap-2 mt-10">
          <Button onClick={navigateToEdit}>Edit Profile</Button>
          <Button bg="bg-secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
