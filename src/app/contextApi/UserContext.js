"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const UserContext = ({ children }) => {
  // Initialize state with localStorage values, if they exist
  const [userauth, setuserauth] = useState(() => {
    if (typeof window !== "undefined") {
      const userdata = localStorage.getItem("auth");
      return userdata ? JSON.parse(userdata) : { user: null, token: "" };
    }
    return { user: null, token: "" };
  });

  // Save auth data to localStorage whenever it changes
  useEffect(() => {
    if (userauth.token) {
      localStorage.setItem("auth", JSON.stringify(userauth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [userauth]);

  // Set axios default headers
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = userauth?.token
      ? `Bearer ${userauth.token}`
      : "";
  }, [userauth.token]);

  return (
    <AuthContext.Provider value={[userauth, setuserauth]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, UserContext };

