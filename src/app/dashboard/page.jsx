"use client";
import React from "react";

const DashboardPage = () => {
  // Sample data
  const usersCount = 100;
  const revenue = 5000;
  const newOrders = 25;
  const messages = 10;

  return (
    <div className="max-w-4xl px-4 py-8 text-slate-950">
      <h1 className="text-3xl font-bold mb-6 text-blue-200">Dashboard</h1>
      <div className="flex flex-wrap gap-6">
        <div className="bg-white rounded-md shadow-md p-2">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="flex flex-col justify-between">
            <span className="text-4xl font-bold">{usersCount}</span>
            <span className="text-gray-600">Total users</span>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-md p-2">
          <h2 className="text-xl font-semibold mb-4">Revenue</h2>
          <div className="flex flex-col justify-between">
            <span className="text-4xl font-bold">${revenue}</span>
            <span className="text-gray-600">Total revenue</span>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-md p-2">
          <h2 className="text-xl font-semibold mb-4">New Orders</h2>
          <div className="flex flex-col justify-between">
            <span className="text-4xl font-bold">{newOrders}</span>
            <span className="text-gray-600">New orders today</span>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-md p-2">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="flex flex-col justify-between">
            <span className="text-4xl font-bold">{messages}</span>
            <span className="text-gray-600">Unread messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
