import { Link } from "react-router-dom";

const TopNav = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-0 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold font-mono">
          MindfulMomentum
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4 hidden md:flex">
          <Link to="/progress" className="hover:text-gray-200">
            Progress
          </Link>
          <Link to="/about" className="hover:text-gray-200">
            About
          </Link>
          <Link to="/contact" className="hover:text-gray-200">
            Contact
          </Link>
          <Link to="/profile" className="hover:text-gray-200">
            Profile
          </Link>
          <Link to="/settings" className="hover:text-gray-200">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
