
import React from 'react'
import { cookies } from 'next/headers'
import Layout from '@/layouts/Layout';


const CookieComponent = () => {
  // Get the cookie
  const cookie = cookies().get('hasAcess');
  // Parse the cookie value
  const parsedCookie = cookie ? JSON.parse(cookie.value.slice(2)) : [];
  return (
    <Layout accessData={parsedCookie} />
    
  )
}

export default CookieComponent;
