import React from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const Error404 = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-slate-900"}`}>
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div
          className={`rounded-3xl p-8 ${
            isDark
              ? "bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.5)] ring-1 ring-slate-800"
              : "bg-white shadow"
          }`}
        >
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-sky-300" : "text-slate-500"}`}>
            Error 404
          </p>
          <h1 className="mt-3 text-4xl font-bold">Page Not Found</h1>
          <p className={`mt-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            The route you tried to visit does not exist.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Error404;
