import React from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import { IoAtCircleSharp } from "react-icons/io5";
import { IoCallSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { FaUserPlus } from "react-icons/fa";
import gifImage from '../assets/whatsapp.gif'
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import ChatSection from "./ChatSection";
import { useDispatch } from "react-redux";
import {
  logout,
  setIsAuthenticated,
  setUserData,
} from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";

const SideBar = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navlinks = [
    {
      path: "/chat",
      icon: IoChatbubblesSharp,
    },
    {
      path: "/find-user",
      icon: FaUserPlus,
    },
    // {
    //   path: "/updates",
    //   icon: IoAtCircleSharp,
    // },
    {
      path: "/call",
      icon: IoCallSharp,
    },
    {
      path: "/profile",
      icon: CgProfile,
    },
  ];

  return (
    <aside className="bg-background overflow-hidden md:h-screen flex flex-col items-center py-2 boxShadow ">
      <div onClick={()=>navigate('/chat')} className="h-7 w-7 hidden md:block rounded-xl bg-primary mt-2 mb-5 cursor-pointer" >
        <img src={gifImage} alt="" className="rounded-full" />
      </div>

      <div className="h-full w-full p-2 flex flex-col justify-between items-center flex-1 ">
        <div className="w-full h-full flex justify-evenly md:justify-start md:flex-col gap-2 items-center">
          {navlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.path}
              className={({ isActive }) =>
                `p-1 flex items-center justify-center w-fit rounded-md cursor-pointer group duration-100 ${
                  isActive ? "bg-text text-background" : "hover:bg-text"
                }`
              }
            >
              <link.icon size={24} className=" group-hover:text-background" />
            </NavLink>
          ))}
        </div>

        <div className="w-full hidden md:flex flex-col gap-2 items-center">
          <div className="p-1 hover:bg-text flex items-center justify-center group w-fit rounded-md cursor-pointer duration-100">
            <IoSettingsSharp
              size={24}
              className="text-text group-hover:text-background"
            />
          </div>
          <div
            onClick={handleLogout}
            className="p-1 hover:bg-text flex items-center justify-center w-fit rounded-md cursor-pointer group duration-100"
          >
            <TbLogout2
              size={24}
              className="text-text group-hover:text-background"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
