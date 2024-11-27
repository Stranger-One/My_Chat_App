import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setLoading } from "../store/authSlice";

const CheckUserAuthentication = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token && !location.pathname.includes("auth")) {
      navigate("/auth/login");
      dispatch(setLoading(false));

      return;
    }

    if (token && location.pathname.includes("auth")) {
      navigate("/chat");
      dispatch(setLoading(false));

      return;
    }
    dispatch(setLoading(false));

  }, [isAuthenticated, location]);

  return <>{children}</>;
};

export default CheckUserAuthentication;
