import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EmptyStatus = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full ">
      <div className="chat-header bg-secondary shadow-md w-full flex gap-2 items-center p-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-surface hover:bg-background cursor-pointer rounded-full"
        >
          <FaArrowLeft size={20} className="text-text" />
        </button>
      </div>

      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-semibold capitalize">
          Select user To See Updates
        </h1>
      </div>
    </div>
  );
};

export default EmptyStatus;
