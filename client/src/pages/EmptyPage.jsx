import React from 'react'
import { IoChatbubblesSharp } from "react-icons/io5";
import gifImage from '../assets/whatsapp.gif'



const EmptyPage = () => {
  return (
    <div className='w-full h-full hidden md:flex bg-background flex-col items-center justify-center' 
    // style={{
    //   backgroundImage: `url(${chatBackground})`,
    // }}
    >
      {/* <IoChatbubblesSharp size={50} className='text-text' /> */}
      <img src={gifImage} alt="" className='w-[200px] rounded-full ' />
      <h1 className=' text-3xl text-text'>Select chat to start message.</h1>
    </div>
  )
}

export default EmptyPage