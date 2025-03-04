import React from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

const Settings = () => {
  return (
    <div>
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>
    </div>
  );
};
export default Settings;
