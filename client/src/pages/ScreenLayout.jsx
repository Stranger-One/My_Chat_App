import React from "react";
import { ChatSection, UpdatesSection } from "../components";
import { Link, Outlet, useNavigate } from "react-router-dom";
import EmptyPage from "./EmptyPage";
import { FaArrowLeft } from "react-icons/fa";

const ScreenLayout = ({
  children,
  chatSection,
  updatesSection,
  noNavigation,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full grid ${
        chatSection || updatesSection
          ? "md:grid-cols-[250px_auto]"
          : "md:grid-cols-[auto]"
      } h-full`}
    >
      {chatSection ? (
        <div className="hidden md:inline-block">
          <ChatSection />
        </div>
      ) : updatesSection ? (
        <div className="hidden md:inline-block">
          <UpdatesSection />
        </div>
      ) : null}
      {/* {chatSection && (<div className="hidden md:inline-block">
        <ChatSection />
      </div>)}
      {updatesSection && (<div className="hidden md:inline-block">
        <UpdatesSection />
      </div>)} */}
      <div className="h-full w-full">
        <div className="chat-header bg-secondary shadow-md w-full flex gap-2 items-center p-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-surface hover:bg-background cursor-pointer rounded-full"
          >
            <FaArrowLeft size={20} className="text-text" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ScreenLayout;
