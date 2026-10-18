import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader";
import { loginUser } from "../../services/authService.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setIsAuthenticated, setUserData } from "../../store/globalSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      if (response?.success) {
        sessionStorage.setItem("token", JSON.stringify(response.token));
        dispatch(setIsAuthenticated(true));
        dispatch(setUserData(response.user));
        toast.success("Logged in successfully");
        navigate("/chat");
      } else {
        toast.error(response?.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-wa-text-primary-light dark:text-wa-text-primary-dark">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">Log into WhatsApp</h2>
        <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
          Enter your email and password to continue to chats.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark block mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark block mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm outline-none focus:border-wa-teal transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-wa-teal hover:bg-wa-teal-hover text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center mt-2"
        >
          {loading ? <Loader size={20} /> : "Log In"}
        </button>

        <p className="text-center text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-2">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-wa-teal font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
