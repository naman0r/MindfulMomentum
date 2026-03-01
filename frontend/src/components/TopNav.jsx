import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TopNav = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className={`p-4 shadow-md transition-colors ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-blue-400 text-white"
      }`}
    >
      <div className="max-w-7xl mx-0 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img src="../../mm-logo.png" alt="logo" className="w-45 h-17" />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 font-mono">
          <Link
            to="/launchpad"
            className={isDark ? "hover:text-sky-300" : "hover:text-gray-200"}
          >
            Launchpad
          </Link>
          <Link
            to="/habits"
            className={isDark ? "hover:text-sky-300" : "hover:text-gray-200"}
          >
            Habits
          </Link>
          <Link
            to="/journal"
            className={isDark ? "hover:text-sky-300" : "hover:text-gray-200"}
          >
            Journal
          </Link>
          <Link
            to="/productivity"
            className={isDark ? "hover:text-sky-300" : "hover:text-gray-200"}
          >
            Productivity
          </Link>
          <Link to="/faq" className={isDark ? "hover:text-sky-300" : "hover:text-gray-200"}>
            FAQ
          </Link>
        </div>

        {/* Profile Image */}
        <div className="flex-shrink-0">
          <Link to="/profile">
            <img
              src={
                user?.photoURL ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
              }
              alt="Profile"
              className={`h-10 w-10 rounded-full transition-all ${
                isDark ? "hover:ring-2 hover:ring-sky-300" : "hover:ring-2 hover:ring-white"
              }`}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
