import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatSection } from '../components';

const ChatPageLayout = () => {
  return (
    <div className="w-full h-full flex overflow-hidden bg-wa-bg-light dark:bg-wa-bg-dark">
      <div className="hidden md:flex h-full">
        <ChatSection />
      </div>
      <div className="flex-1 h-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatPageLayout;