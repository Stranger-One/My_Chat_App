import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { checkAuthentication } from "./services/authService";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated, setUserData } from "./store/authSlice";
import { Loader } from "./components";

const App = () => {
  const dispatch = useDispatch();
  const token = JSON.parse(sessionStorage.getItem("token"));
  const loading = useSelector((status) => status.auth.loading);

  const authenticate = async () => {
    const response = await checkAuthentication(token);
    // console.log(response);

    if (response?.success) {
      dispatch(setIsAuthenticated(true));
      dispatch(setUserData(response.user));
    }
  };

  useEffect(() => {
    authenticate();
  }, []);



  return (
    <main className="w-full h-screen bg-background relative">
      <Outlet />
      {/* {loading && (
        <div className="w-full h-full fixed top-0 left-0 bg-black flex items-center justify-center z-10">
          <Loader size="40"/>
        </div>
      )} */}
      <Toaster />
    </main>
  );
};

export default App;
