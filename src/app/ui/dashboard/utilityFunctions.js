const getUserRole = (userauth) => {
    return userauth?.user?.role || 0; // Default to 0 if user or role is undefined
  };
  
const getUserToken = (userauth)=>{
  return userauth?.token || null
};

  export { getUserRole, getUserToken };