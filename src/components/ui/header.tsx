'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, History, Home, LogIn, UserPlus, Settings, UploadIcon } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const { user, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <header className="bg-blue-700 text-white shadow-md z-50 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-wide hover:text-yellow-300 transition">
          WATCHAI
        </Link>

        {/* Navigation */}
        <nav>
          {!loading && user ? (
            <div className="flex items-center space-x-6 relative">
              <Link href="/home" className="flex items-center hover:text-yellow-300 transition">
                <Home className="w-5 h-5 mr-1" /> Home
              </Link>

              <Link href="/watch-history" className="flex items-center hover:text-yellow-300 transition">
                <History className="w-5 h-5 mr-1" /> History
              </Link>

              {/* Username Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center bg-yellow-400 text-blue-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                >
                  <User className="w-4 h-4 mr-1" />
                  {user.displayName || 'Account'}
                </button>

                {dropdownOpen && (
  <div
    className="absolute right-0 mt-2 w-48 bg-white text-blue-800 rounded shadow-lg z-50"
    onMouseLeave={closeDropdown}
  >
    <Link
      href="/changepref"
      onClick={closeDropdown}
      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
    >
      <Settings className="w-4 h-4" />
      Change Preference
    </Link>

    <Link
      href="/UploadPage"
      onClick={closeDropdown}
      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
    >
      <UploadIcon className="w-4 h-4" />
      Upload Video
    </Link>

    <button
      onClick={() => {
        logout();
        closeDropdown();
      }}
      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
)}

              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="flex items-center hover:text-yellow-300 transition">
                <LogIn className="w-5 h-5 mr-1" /> Log In
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center bg-yellow-400 text-blue-800 hover:bg-yellow-300 font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <UserPlus className="w-4 h-4 mr-1" /> Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
