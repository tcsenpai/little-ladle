import React from 'react';
import { ChildProfile } from '../types/child';
import { calculateAge } from '../utils/ageCalculation';

interface ChildProfileBarProps {
  profile: ChildProfile | null;
  onEditProfile: () => void;
  onCreateProfile: () => void;
}

export function ChildProfileBar({ profile, onEditProfile, onCreateProfile }: ChildProfileBarProps) {
  if (!profile) {
    return (
      <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">👶</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                No Child Profile
              </h3>
              <p className="text-sm text-amber-700 font-medium">
                Create a profile for personalized WHO nutrition tracking
              </p>
            </div>
          </div>
          <button
            onClick={onCreateProfile}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
          >
            <span className="text-lg">✨</span>
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const ageCalc = calculateAge(profile.birthday);
  
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
    <div className="bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Child Avatar */}
          <div className={`w-16 h-16 bg-gradient-to-r ${profile.sex === 'female' ? 'from-pink-500 to-violet-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center shadow-xl`}>
            <span className="text-3xl">{profile.sex === 'female' ? '👧' : '👦'}</span>
          </div>
          
          {/* Child Info */}
          <div>
            <h3 className="text-2xl font-black text-gray-800 mb-1">
              {profile.name}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">Age:</span>
                <span className="font-black text-transparent bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text">
                  {ageCalc.displayAge}
                </span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">Sex:</span>
                <span className="capitalize font-bold text-gray-700">{profile.sex}</span>
              </div>
            </div>
          </div>

          {/* WHO Status Badge */}
          <div className={`bg-gradient-to-r ${whoColor} text-white px-4 py-3 rounded-2xl shadow-lg`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{whoIcon}</span>
              <div>
                <div className="font-black text-sm leading-tight">{whoStatus}</div>
                <div className="text-xs opacity-90">Active Guidelines</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEditProfile}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-black text-sm rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
        >
          <span className="text-lg">✏️</span>
          Edit Profile
        </button>
      </div>
    </div>
  );
}