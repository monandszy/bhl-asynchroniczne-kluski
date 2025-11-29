import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function TopBar() {
  const location = useLocation();
  const isComplaintPage = location.pathname === "/complaint";
  const isFeedPage = location.pathname === "/feed";

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-900 to-[#308c16] shadow-lg z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <img
            src={logo}
            alt="ECOnfident Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
          />
          <h1 className="text-white text-xl sm:text-3xl font-bold tracking-wide">
            ECOnfident
          </h1>
        </div>
        {isFeedPage && (
          <Link
            to="/complaint"
            className="bg-white text-green-900 font-bold px-3 sm:px-6 py-2 rounded-lg hover:bg-green-50 transition-all shadow-md text-sm sm:text-base"
          >
            Zgłoś incydent
          </Link>
        )}
        {isComplaintPage && (
          <Link
            to="/feed"
            className="bg-white text-green-900 font-bold px-3 sm:px-6 py-2 rounded-lg hover:bg-green-50 transition-all shadow-md text-sm sm:text-base flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Powrót</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default TopBar;
