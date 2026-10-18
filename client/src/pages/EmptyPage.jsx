import React from "react";
import { BsLockFill } from "react-icons/bs";
import { RiWhatsappFill } from "react-icons/ri";

const EmptyPage = () => {
  return (
    <div className="w-full h-full hidden md:flex flex-col items-center justify-center bg-wa-bg-light dark:bg-wa-bg-dark border-l border-wa-border-light dark:border-wa-border-dark p-6 select-none text-center">
      <div className="max-w-[460px] flex flex-col items-center">
        {/* WhatsApp Web Brand Graphic */}
        <div className="w-24 h-24 rounded-full bg-wa-teal/10 dark:bg-wa-teal/20 text-wa-teal flex items-center justify-center mb-6 shadow-sm">
          <RiWhatsappFill size={64} />
        </div>

        <h1 className="text-3xl font-light text-wa-text-primary-light dark:text-wa-text-primary-dark mb-3">
          WhatsApp Web
        </h1>

        <p className="text-sm text-wa-text-secondary-light dark:text-wa-text-secondary-dark leading-relaxed mb-8">
          Send and receive messages seamlessly without keeping your phone online.
          Enjoy voice calls, high-definition video calling, and end-to-end encrypted conversations with friends and family.
        </p>

        <div className="flex items-center gap-1.5 text-xs text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-6">
          <BsLockFill size={11} />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;