import React from "react";
import { LogOut, User as ProfileIcon } from "lucide-react";
import type { User } from "../../store/useAuthStore";

interface HeaderProps {
  user: User;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onProfileClick,
  onLogoutClick,
}) => {
  return (
   <header className="shadow-sm z-30 pt-2 border-b border-gray-200 backdrop-blur-[2px] bg-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Comegle 
              {/* <span className="text-[15px]  text-white">
                -Omegle but for Colleges ;)
              </span> */}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onProfileClick}
              title="Profile"
              className="flex items-center hover:cursor-pointer space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <ProfileIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.username}
              </span>
            </button>

            <button
              onClick={onLogoutClick}
              className="p-2 text-gray-500 hover:cursor-pointer hover:text-red-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
