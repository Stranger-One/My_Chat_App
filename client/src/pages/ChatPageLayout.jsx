import React from 'react'
import { Outlet } from 'react-router-dom'
import { ChatSection } from '../components'

const ChatPageLayout = () => {
  return (
    <div className='bg-gray-200 h-[calc(100vh-50px)] md:h-screen md:grid md:grid-cols-[250px_auto] '>
      <ChatSection/>
      <Outlet />
    </div>
  )
}

export default ChatPageLayout