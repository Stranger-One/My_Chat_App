import React from 'react'
import { BiLoaderCircle } from "react-icons/bi";

const Loader = ({size=20, color="white"}) => {
  return (
    <BiLoaderCircle size={size} color={color} className='mx-auto animate-spin' />
  )
}

export default Loader