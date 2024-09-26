"use client";
import React, { useState } from 'react';
import { FaLock, FaLockOpen } from 'react-icons/fa';

const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={toggleModal}
        >
          Add User
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 text-black">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row, replace with your data */}
          <tr>
            <td className="py-2 px-4 border-b">John Doe</td>
            <td className="py-2 px-4 border-b">john@example.com</td>
            <td className="py-2 px-4 border-b">Admin</td>
            <td className="py-2 px-4 border-b">
              <button className="text-blue-500 hover:text-blue-700">Edit</button>
              <button className="text-red-500 hover:text-red-700 ml-2">Delete</button>
            </td>
          </tr>
          {/* More rows */}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-black">
          <div className="bg-black bg-opacity-50 absolute inset-0" onClick={toggleModal}></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-4">Add User</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 flex items-center"
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? <FaLockOpen /> : <FaLock />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role</label>
                <input
                  type="text"
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
