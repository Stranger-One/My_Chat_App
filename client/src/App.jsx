import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { checkAuthentication } from "./services/authService";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsAuthenticated,
  setUserData,
} from "./store/globalSlice";
import { CallPageLayout } from "./pages";


const App = () => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  const dispatch = useDispatch();

  const authenticate = async () => {
    const response = await checkAuthentication(token);
    // console.log(response);

    if (response?.success) {
      dispatch(setIsAuthenticated(true));
      dispatch(setUserData(response.user));
    }
  };

  const callInformation = {
    title: "Call Information",
    call: "incomming", // incomming / outgoing
    callType: "voice", // voice / video
    callDuration: "00:00:00",
    callDate: "2022-01-01",
    callTime: "00:00:00",
    to:{
      name: "John Doe",
      email: "",
      prifilePic: '',
      id: ''
    },
    from:{
      name: "John Doe",
      email: "",
      prifilePic: '',
      id: ''
    },
  }

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <main className="w-full h-screen bg-background relative overflow-hidden">
      <Outlet />
      <Toaster />
      <CallPageLayout />
    </main>
  );
};

export default App;
