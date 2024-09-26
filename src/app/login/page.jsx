"use client";
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUnlock } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
const SignIn = () => {
  const router = useRouter();
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [userauth, setuserauth] = useAuth();
  const [type, setType] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = {
          user: response.data.user,
          token: response.data.token,
        };
        setuserauth(userData);
        localStorage.setItem("auth", JSON.stringify(userData));
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      alert("check your credentials");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 text-black">
      <form
        onSubmit={logIn}
        className="max-w-md w-full p-6 bg-white rounded-md shadow-md"
      >
        <div className="w-full bg-black py-2 mb-4 rounded-md flex box-border px-4 gap-2">
          <Image
            src="/tmlogo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-8 w-auto mr-2"
          />
          <h1 className="text-2xl">
            <span className="text-[#3EDBF0]">Tech</span>
            <span className="text-[#FFFFFF]">Momentum</span>
          </h1>
        </div>
        <div className="mb-4 relative">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setemail(e.target.value)}
              className="w-full border rounded-md py-2 px-3 pl-10 focus:outline-none focus:border-blue-500"
            />
            <FaEnvelope className="icon absolute top-2 right-3 text-teal-500" />
          </div>
        </div>
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type={type ? "password" : "text"}
              placeholder="Password"
              onChange={(e) => setpassword(e.target.value)}
              className="w-full border rounded-md py-2 px-3 pl-10 focus:outline-none focus:border-blue-500"
            />
            {type ? (
              <FaLock
                className="icon absolute top-2 right-3 cursor-pointer text-teal-500"
                onClick={() => setType(!type)}
              />
            ) : (
              <FaUnlock
                className="icon absolute top-2 right-3 cursor-pointer text-teal-500"
                onClick={() => setType(!type)}
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;
