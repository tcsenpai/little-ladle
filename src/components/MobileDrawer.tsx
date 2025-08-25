import React from 'react';
import { ChildProfile } from '../types/child';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickStart: () => void;
  onAutoChef: () => void;
  onAddFood: () => void;
  childProfile: ChildProfile | null;
  onCreateProfile: () => void;
  onEditProfile: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  onQuickStart,
  onAutoChef,
  onAddFood,
  childProfile,
  onCreateProfile,
  onEditProfile
}: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-xl">🍽️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">PappoBot</h2>
                <p className="text-xs text-white/80">Mobile Menu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Child Profile Section */}
          {childProfile ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${childProfile.sex === 'female' ? 'from-pink-500 to-violet-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center`}>
                  <span className="text-sm">{childProfile.sex === 'female' ? '👧' : '👦'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-slate-100">{childProfile.name}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  onEditProfile();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">No Child Profile</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">Create a profile for personalized nutrition tracking</p>
              <button
                onClick={() => {
                  onCreateProfile();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                Create Profile
              </button>
            </div>
          )}

          {/* Main Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Quick Actions</h3>
            
            {/* Auto-Chef */}
            <button
              onClick={() => {
                onAutoChef();
                onClose();
              }}
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl transition-all duration-200 transform active:scale-95 shadow-md"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold">Auto-Chef AI</div>
                <div className="text-xs text-white/80">Get instant meal suggestions</div>
              </div>
            </button>

            {/* Quick-Start */}
            <button
              onClick={() => {
                onQuickStart();
                onClose();
              }}
              className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform active:scale-95 shadow-md"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-lg">🚀</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold">Quick-Start Templates</div>
                <div className="text-xs text-white/80">Age-appropriate meal ideas</div>
              </div>
            </button>

            {/* Add Food */}
            <button
              onClick={() => {
                onAddFood();
                onClose();
              }}
              className="w-full flex items-center space-x-4 p-4 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 border-2 border-orange-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-slate-500 rounded-xl transition-all duration-200 transform active:scale-95 shadow-md"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <span className="text-lg text-orange-600 dark:text-orange-400">+</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-gray-800 dark:text-slate-100">Add Custom Food</div>
                <div className="text-xs text-gray-600 dark:text-slate-400">Add foods not in database</div>
              </div>
            </button>
          </div>

          {/* Help & Info */}
          <div className="pt-6 border-t border-gray-200 dark:border-slate-600">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-lg">ℹ️</span>
                <span>WHO-compliant nutrition tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-lg">🎯</span>
                <span>Age-appropriate food recommendations</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-slate-400">
                <span className="text-lg">📊</span>
                <span>Real-time nutrition analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}