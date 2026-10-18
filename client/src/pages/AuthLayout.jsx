import React from "react";
import { Outlet } from "react-router-dom";
import { RiWhatsappFill } from "react-icons/ri";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-wa-bg-light dark:bg-wa-bg-dark flex flex-col relative select-none">
      {/* WhatsApp Green Top Banner */}
      <div className="h-48 md:h-56 w-full bg-wa-teal dark:bg-wa-teal-dark flex items-start px-8 pt-8">
        <div className="flex items-center gap-3 text-white max-w-5xl mx-auto w-full">
          <RiWhatsappFill size={36} />
          <span className="font-bold tracking-wider text-sm uppercase">WhatsApp Web</span>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="flex-1 flex items-center justify-center px-4 -mt-24 md:-mt-28 mb-8 z-10">
        <div className="w-full max-w-md bg-wa-panel-light dark:bg-wa-panel-dark rounded-2xl shadow-wa-modal border border-wa-border-light dark:border-wa-border-dark overflow-hidden p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;