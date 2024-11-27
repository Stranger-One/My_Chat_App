import React from 'react'
import { IoChatbubblesSharp } from "react-icons/io5";


const EmptyPage = () => {
  return (
    <div className='w-full h-full hidden md:flex bg-background flex-col items-center justify-center'>
      <IoChatbubblesSharp size={50} className='text-text' />
      <h1 className=' text-3xl text-text'>Select chat to start message.</h1>
    </div>
  )
}

export default EmptyPage