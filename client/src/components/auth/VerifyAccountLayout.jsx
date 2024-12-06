import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import Button from "../Button";
import Input from "../Input";
import toast from "react-hot-toast";
import { sendVerification, verifyAccount } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../../store/globalSlice";

const VerifyAccountLayout = () => {
  const [slide, setSlide] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('')
  const userData = useSelector((state) => state.global.userData);
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSendVarificationOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    
    // api call to send otp
    const response = await sendVerification(userData?.email)

    // console.log(response);
    if(response.success){
      toast.success(response.message)
    }

    setSlide(2);
    setLoading(false);
  };

  const handleVarification = async (e) => {
    e.preventDefault()
    setLoading(true);

    const data = {
      email: userData.email,
      otp: otp
    }
    // api call to verify account
    const response = await verifyAccount(data)
    // console.log(response);
    if(response.success){
      toast.success(response.message)

      dispatch(setUserData(response.user))

      setSlide(1);
      navigate("/profile")
    } else {
      toast.error(response.message)
    }

    
    setLoading(false);
    
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {slide == 1 && (
        <form
          onSubmit={handleSendVarificationOtp}
          className=" bg-secondary p-4 flex flex-col items-center gap-2 min-w-[250px] "
        >
          <div
            className="w-16 h-16 bg-surface rounded-full overflow-hidden relative bg-cover"
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
            <Input
              type="email"
              name="email"
              value={userData?.email}
              placeholder="Email"
              label="Email"
              readOnly={true}
            />
          </div>
          <div className="w-full flex justify-end mt-4">
            <Button type="submit" className="w-full">
              {loading ? <Loader /> : "Send Otp"}
            </Button>
          </div>
        </form>
      )}
      {slide == 2 && (
        <form
          onSubmit={handleVarification}
          className=" bg-secondary p-4 flex flex-col items-center gap-2 min-w-[250px] "
        >
          <div className="w-full">
            <button onClick={() => setSlide(1)} className="w-8 h-8 bg-background flex items-center justify-center rounded-full">
              <FaArrowLeft />
            </button>
          </div>
          <div
            className="w-16 h-16 bg-surface rounded-full overflow-hidden relative bg-cover"
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
            <Input
              type="text"
              name="otp"
              value={otp}
              onChange={(e)=> setOtp(e.target.value)}
              placeholder="Enter Verification OTP"
              label="OTP"
            />
          </div>
          <div className="w-full flex justify-end mt-4">
            <Button type="submit" className="w-full">
              {loading ? <Loader /> : "Verify Account"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerifyAccountLayout;
