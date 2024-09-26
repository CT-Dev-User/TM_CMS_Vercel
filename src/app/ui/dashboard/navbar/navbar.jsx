"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
const Navbar = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
      setUserName("user");
    } else {
      setUserName(`${userauth.user.email.split("@")[0]}`);
      setLoading(false);
    }
  }, [userauth, router]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="w-full flex justify-between items-center h-16">
              <div className="w-full flex justify-between">
                <div className="flex gap-2">
                  <Image
                    src="/tmlogo.png"
                    alt="Logo"
                    layout="intrinsic"
                    width={32} // or another value to maintain aspect ratio
                    height={32} // or another value to maintain aspect ratio
                  />
                  <h4 className="text-2xl">
                    <span className="text-[#3EDBF0]">Tech</span>
                    <span className="text-[#FFFFFF]">Momentum</span>
                  </h4>
                </div>
                <h4 className="w-fit text-2xl flex gap-2 text-white">
                  <strong>{userName}</strong>
                  <FaUser className="mt-1" />
                </h4>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
