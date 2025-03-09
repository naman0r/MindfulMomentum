import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TopNav = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-400 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-0 flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img src="../../mm-logo.png" alt="logo" className="w-45 h-17" />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 font-mono">
          <Link to="/habits" className="hover:text-gray-200">
            Habits
          </Link>
          <Link to="/journal" className="hover:text-gray-200">
            Journal
          </Link>
          <Link to="/productivity" className="hover:text-gray-200">
            Productivity
          </Link>
          <Link to="/settings" className="hover:text-gray-200">
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
              className="h-10 w-10 rounded-full hover:ring-2 hover:ring-white transition-all"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
