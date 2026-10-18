import React from "react";
import { RiDonutChartFill } from "react-icons/ri";

const EmptyStatus = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-wa-bg-light dark:bg-wa-bg-dark text-center select-none">
      <div className="w-20 h-20 rounded-full bg-wa-teal/10 flex items-center justify-center text-wa-teal mb-4">
        <RiDonutChartFill size={44} />
      </div>
      <h3 className="text-xl font-light text-wa-text-primary-light dark:text-wa-text-primary-dark mb-1">
        No status selected
      </h3>
      <p className="text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark max-w-xs">
        Click on a contact from the list on the left to view their status updates.
      </p>
    </div>
  );
};

export default EmptyStatus;
