import React from "react";
import { 
  BsChatLeftTextFill, 
  BsCameraVideoFill, 
  BsTelephoneFill, 
  BsPersonFill, 
  BsSunFill, 
  BsMoonFill,
  BsPlusLg
} from "react-icons/bs";
import { RiDonutChartFill } from "react-icons/ri"; // WhatsApp Status icon
import { TbLogout2 } from "react-icons/tb";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, toggleTheme } from "../store/globalSlice";
import { useSocket } from "../contexts/SocketProvider";

const SideBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.global.theme);
  const userData = useSelector((state) => state.global.userData);
  const allConversation = useSelector((state) => state.global.allConversation);

  // Total unread messages count
  const unreadCount = allConversation?.reduce(
    (acc, curr) => acc + (curr?.unseenMessages || 0),
    0
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const navlinks = [
    {
      title: "Chats",
      path: "/chat",
      icon: BsChatLeftTextFill,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      title: "Status",
      path: "/updates",
      icon: RiDonutChartFill,
    },
    {
      title: "Calls",
      path: "/call",
      icon: BsTelephoneFill,
    },
    {
      title: "New Chat",
      path: "/find-user",
      icon: BsPlusLg,
    },
  ];

  return (
    <aside className="h-[60px] md:h-screen w-full md:w-[64px] bg-wa-header-light dark:bg-wa-header-dark border-t md:border-t-0 md:border-r border-wa-border-light dark:border-wa-border-dark flex md:flex-col justify-between items-center py-2 px-3 md:px-0 z-40 select-none">
      {/* Top Section */}
      <div className="flex md:flex-col items-center gap-3 w-full justify-around md:justify-start">
        {/* WhatsApp App Logo */}
        <div 
          onClick={() => navigate("/chat")}
          className="hidden md:flex w-10 h-10 rounded-full items-center justify-center cursor-pointer mb-2 group relative"
          title="WhatsApp Web"
        >
          <div className="w-8 h-8 rounded-full bg-wa-teal flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <BsChatLeftTextFill size={16} />
          </div>
        </div>

        {/* Navigation Items */}
        {navlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            title={link.title}
            className={({ isActive }) =>
              `relative p-2.5 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? "bg-wa-border-light dark:bg-wa-surface text-wa-teal font-bold shadow-sm"
                  : "text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-border-light dark:hover:bg-wa-surface hover:text-wa-text-primary-light dark:hover:text-wa-text-primary-dark"
              }`
            }
          >
            <link.icon size={19} />
            {link.badge && (
              <span className="absolute -top-0.5 -right-0.5 bg-wa-badge text-white font-semibold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="flex md:flex-col items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={() => dispatch(toggleTheme())}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-full text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-border-light dark:hover:bg-wa-surface transition-all"
        >
          {theme === "dark" ? (
            <BsSunFill size={18} className="text-amber-400" />
          ) : (
            <BsMoonFill size={17} className="text-slate-600" />
          )}
        </button>

        {/* Profile Avatar / Link */}
        <NavLink
          to="/profile"
          title="Profile & Settings"
          className={({ isActive }) =>
            `relative w-9 h-9 rounded-full overflow-hidden transition-all border-2 ${
              isActive ? "border-wa-teal ring-2 ring-wa-teal/30" : "border-transparent hover:opacity-90"
            }`
          }
        >
          <img
            src={userData?.profilePic || "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </NavLink>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Log out"
          className="p-2.5 rounded-full text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-rose-500/10 hover:text-rose-500 transition-all hidden md:flex"
        >
          <TbLogout2 size={20} />
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
