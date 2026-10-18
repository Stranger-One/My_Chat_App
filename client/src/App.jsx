import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { checkAuthentication } from "./services/authService";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated, setUserData, setTheme } from "./store/globalSlice";
import { CallPageLayout } from "./pages";

const App = () => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  const theme = useSelector((state) => state.global.theme);
  const dispatch = useDispatch();

  const authenticate = async () => {
    if (!token) return;
    try {
      const response = await checkAuthentication(token);
      if (response?.success) {
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData(response.user));
      }
    } catch (err) {
      console.warn("Auth check failed:", err);
    }
  };

  useEffect(() => {
    authenticate();
    const savedTheme = localStorage.getItem("wa_theme") || "dark";
    dispatch(setTheme(savedTheme));
  }, []);

  return (
    <main className="w-full h-screen bg-wa-bg-light dark:bg-wa-bg-dark text-wa-text-primary-light dark:text-wa-text-primary-dark relative overflow-hidden font-sans">
      <Outlet />
      <Toaster position="top-center" reverseOrder={false} />
      <CallPageLayout />
    </main>
  );
};

export default App;
