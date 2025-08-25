import React from 'react';
import { ChildProfile } from '../types/child';
import { calculateAge } from '../utils/ageCalculation';

interface ChildProfileBarProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  onSelectProfile: (profile: ChildProfile) => void;
  onEditProfile: () => void;
  onCreateProfile: () => void;
}

export function ChildProfileBar({ profiles, activeProfile, onSelectProfile, onEditProfile, onCreateProfile }: ChildProfileBarProps) {
  if (profiles.length === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-3 mb-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg">👶</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                No Child Profile
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium transition-colors duration-300">
                Create a profile for personalized WHO nutrition tracking
              </p>
            </div>
          </div>
          <button
            onClick={onCreateProfile}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-1"
          >
            <span className="text-sm">✨</span>
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return null;
  }
  
  const ageCalc = calculateAge(activeProfile.birthday);
  
  // Determine WHO compliance status
  let whoStatus = '';
  let whoColor = '';
  let whoIcon = '';
  
  switch (ageCalc.ageGroup) {
    case 'under_6_months':
      whoStatus = 'Exclusive feeding period';
      whoColor = 'from-blue-500 to-cyan-500';
      whoIcon = '🍼';
      break;
    case '6-12_months':
      whoStatus = 'WHO complementary feeding (6-12m)';
      whoColor = 'from-emerald-500 to-sky-500';
      whoIcon = '🥄';
      break;
    case '12-24_months':
      whoStatus = 'WHO complementary feeding (12-24m)';
      whoColor = 'from-emerald-500 to-sky-500';
      whoIcon = '🍽️';
      break;
    case 'over_24_months':
      whoStatus = 'Toddler nutrition guidelines';
      whoColor = 'from-violet-500 to-purple-500';
      whoIcon = '🧒';
      break;
  }

  return (
    <div className="bg-gradient-to-r from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-700/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 dark:border-slate-600/50 p-3 mb-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Child Selector or Single Profile */}
          {profiles.length > 1 ? (
            <div className="flex items-center gap-3">
              {/* Child Avatar */}
              <div className={`w-10 h-10 bg-gradient-to-r ${activeProfile.sex === 'female' ? 'from-pink-500 to-violet-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{activeProfile.sex === 'female' ? '👧' : '👦'}</span>
              </div>
              
              {/* Child Dropdown */}
              <div>
                <select
                  value={activeProfile.id}
                  onChange={(e) => {
                    const selectedProfile = profiles.find(p => p.id === e.target.value);
                    if (selectedProfile) onSelectProfile(selectedProfile);
                  }}
                  className="text-sm font-bold text-gray-800 dark:text-slate-100 bg-transparent border-none focus:outline-none cursor-pointer transition-colors duration-300"
                >
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id} className="bg-white dark:bg-slate-800">
                      {profile.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-600 dark:text-slate-400 transition-colors duration-300">
                  {ageCalc.displayAge} • {activeProfile.sex}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Single Child Avatar */}
              <div className={`w-10 h-10 bg-gradient-to-r ${activeProfile.sex === 'female' ? 'from-pink-500 to-violet-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{activeProfile.sex === 'female' ? '👧' : '👦'}</span>
              </div>
              
              {/* Single Child Info */}
              <div>
                <h3 className="text-sm font-black text-gray-800 dark:text-slate-100 transition-colors duration-300">
                  {activeProfile.name}
                </h3>
                <div className="text-xs text-gray-600 dark:text-slate-400 transition-colors duration-300">
                  {ageCalc.displayAge} • {activeProfile.sex}
                </div>
              </div>
            </div>
          )}

          {/* Compact WHO Status Badge */}
          <div className={`bg-gradient-to-r ${whoColor} text-white px-2 py-1 rounded-lg shadow-sm ml-2`}>
            <div className="flex items-center gap-1">
              <span className="text-sm">{whoIcon}</span>
              <div className="text-xs font-bold leading-tight">{whoStatus}</div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateProfile}
            className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-xs rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center gap-1"
            title="Add Child"
          >
            <span className="text-xs">👶</span>
            <span className="text-xs">+</span>
          </button>
          <button
            onClick={onEditProfile}
            className="px-2 py-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-xs rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center gap-1"
            title="Edit Profile"
          >
            <span className="text-xs">✏️</span>
          </button>
        </div>
      </div>
    </div>
  );
}