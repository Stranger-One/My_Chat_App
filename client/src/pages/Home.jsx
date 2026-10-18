import React from 'react';
import EmptyPage from './EmptyPage';
import { ChatSection } from '../components';

const Home = () => {
  return (
    <div className="w-full h-full flex overflow-hidden bg-wa-bg-light dark:bg-wa-bg-dark">
      <ChatSection />
      <EmptyPage />
    </div>
  );
};

export default Home;