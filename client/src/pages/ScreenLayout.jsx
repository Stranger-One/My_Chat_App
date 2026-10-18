import React from "react";
import { ChatSection, UpdatesSection } from "../components";
import { useLocation, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";

const ScreenLayout = ({
  children,
  chatSection,
  updatesSection,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.replace("/", "").replace("-", " ");

  return (
    <div className="w-full h-full flex overflow-hidden bg-wa-bg-light dark:bg-wa-bg-dark">
      {chatSection && (
        <div className="hidden md:flex h-full">
          <ChatSection />
        </div>
      )}
      {updatesSection && (
        <div className="hidden md:flex h-full">
          <UpdatesSection />
        </div>
      )}

      <div className="flex-1 h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark overflow-hidden">
        <div className="h-[60px] px-4 flex items-center gap-3 bg-wa-header-light dark:bg-wa-header-dark border-b border-wa-border-light dark:border-wa-border-dark select-none">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-wa-surface text-wa-text-secondary-light dark:text-wa-text-secondary-dark transition-colors"
          >
            <BsArrowLeft size={19} />
          </button>
          <h2 className="text-lg font-bold text-wa-text-primary-light dark:text-wa-text-primary-dark capitalize">
            {title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScreenLayout;
