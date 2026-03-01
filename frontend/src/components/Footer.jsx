import React from "react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <footer
        className={`fixed bottom-0 w-full p-2 shadow-lg transition-colors ${
          isDark
            ? "bg-slate-950 text-slate-300"
            : "bg-gray-800 text-gray-300"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            <span className={`font-bold ${isDark ? "text-slate-100" : "text-white"}`}>
              MindfulMomentum
            </span>{" "}
            ©{" "}
            {new Date().getFullYear()}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className={`transition-colors ${isDark ? "hover:text-sky-300" : "hover:text-white"}`}
            >
              Privacy
            </a>
            <a
              href="#"
              className={`transition-colors ${isDark ? "hover:text-sky-300" : "hover:text-white"}`}
            >
              Terms
            </a>
            <a
              href="https://chromewebstore.google.com/detail/mindfulmomentum/fhnmaioanoafpmkikblmoahbnlnboikk"
              target="_blank"
              className={`transition-colors ${
                isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-white"
              }`}
            >
              Download the extension!
            </a>
            <p>PWA version</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
