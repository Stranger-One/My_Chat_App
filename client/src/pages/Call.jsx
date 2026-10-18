import React from "react";
import { CallComp } from "../components";
import { useSelector } from "react-redux";
import { BsTelephonePlus } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const Call = () => {
  const callList = useSelector((state) => state.global.callLogs);
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col bg-wa-panel-light dark:bg-wa-panel-dark select-none">
      {/* Header */}
      <div className="h-[60px] px-6 border-b border-wa-border-light dark:border-wa-border-dark flex items-center justify-between bg-wa-header-light dark:bg-wa-header-dark">
        <h1 className="text-xl font-bold text-wa-text-primary-light dark:text-wa-text-primary-dark">
          Calls
        </h1>
        <button
          onClick={() => navigate("/find-user")}
          title="New call"
          className="p-2 rounded-full text-wa-text-secondary-light dark:text-wa-text-secondary-dark hover:bg-wa-surface transition-colors"
        >
          <BsTelephonePlus size={19} />
        </button>
      </div>

      {/* Call Logs List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {callList && callList.length > 0 ? (
          <div className="flex flex-col">
            {callList.map((call, index) => (
              <CallComp key={call._id || index} call={call} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 text-center text-wa-text-secondary-light dark:text-wa-text-secondary-dark">
            <div className="w-16 h-16 rounded-full bg-wa-surface flex items-center justify-center mb-3">
              <BsTelephonePlus size={26} className="text-wa-teal" />
            </div>
            <p className="font-semibold text-base text-wa-text-primary-light dark:text-wa-text-primary-dark mb-1">
              No call history
            </p>
            <p className="text-xs max-w-xs">
              Voice and video calls with your contacts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Call;