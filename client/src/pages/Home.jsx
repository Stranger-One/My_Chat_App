import React from 'react'
import EmptyPage from './EmptyPage'
import { ChatSection } from '../components'

const Home = () => {
  return (
    <div className="w-full md:grid md:grid-cols-[250px_auto] md:h-[calc(100vh-0px)] ">
      <ChatSection />
      <EmptyPage />
    </div>
  )
}

export default Home