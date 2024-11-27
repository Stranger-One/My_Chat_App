import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <section className='w-full h-full flex items-center justify-center'>
      <Outlet />
    </section>
  )
}

export default AuthLayout