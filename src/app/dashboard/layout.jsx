"use client";
import React, { useEffect, useState } from 'react'
import Sidebar from '../ui/dashboard/sidebar/sidebar'
import Navbar from '../ui/dashboard/navbar/navbar'
import '../ui/dashboard/dasshboard.css'
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from 'next/navigation';



const Layout = ({ children }) => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push('/'); // Redirect to login page if not authenticated
    } else {
      setLoading(false)
    }
  }, [userauth, router]);
  
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-[100vw] flex">
          <div className="w-[18%] menu">
            <Sidebar />
          </div>
          <div className="w-[82%] box-border p-[20px] h-screen overflow-y-auto custom-scrollbar">
            <Navbar />
            {children}
          </div>
        </div>
      )
      }
    </>
  )
}

export default Layout