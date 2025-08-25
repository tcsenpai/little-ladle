import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 group"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Toggle Background */}
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }`}
      />
      
      {/* Toggle Circle */}
      <div
        className={`relative w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-3' : '-translate-x-3'
        }`}
      >
        {/* Icon */}
        <span className="text-xs">
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-white blur-sm" />
    </button>
  );
}