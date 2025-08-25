import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../types/child';
import { calculateAge } from '../utils/ageCalculation';

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: ChildProfile) => void;
  existingProfile?: ChildProfile | null;
}

export function ChildProfileModal({ isOpen, onClose, onSave, existingProfile }: ChildProfileModalProps) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('female');
  const [agePreview, setAgePreview] = useState<string>('');
  const [ageGroupPreview, setAgeGroupPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setBirthday(existingProfile.birthday);
      setSex(existingProfile.sex);
    } else {
      // Reset form for new profile
      setName('');
      setBirthday('');
      setSex('female');
    }
  }, [existingProfile, isOpen]);

  // Update age preview when birthday changes
  useEffect(() => {
    if (birthday) {
      try {
        const ageCalc = calculateAge(birthday);
        setAgePreview(ageCalc.displayAge);
        
        // Age group preview with WHO compliance
        let groupLabel = '';
        switch (ageCalc.ageGroup) {
          case 'under_6_months':
            groupLabel = 'Under 6 months (exclusive breast/formula feeding)';
            break;
          case '6-12_months':
            groupLabel = '6-12 months (WHO complementary feeding guidelines apply)';
            break;
          case '12-24_months':
            groupLabel = '12-24 months (WHO complementary feeding guidelines apply)';
            break;
          case 'over_24_months':
            groupLabel = 'Over 24 months (toddler nutrition guidelines)';
            break;
        }
        setAgeGroupPreview(groupLabel);
        setError('');
      } catch (err) {
        setAgePreview('');
        setAgeGroupPreview('');
      }
    } else {
      setAgePreview('');
      setAgeGroupPreview('');
    }
  }, [birthday]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    
    if (!birthday) {
      setError('Please select a birthday');
      return;
    }
    
    // Validate birthday is not in the future
    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate > today) {
      setError('Birthday cannot be in the future');
      return;
    }
    
    // Validate age is reasonable (not more than 5 years old)
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (ageInYears > 5) {
      setError('Age seems too old for this app (max 5 years)');
      return;
    }
    
    if (ageInYears < 0) {
      setError('Invalid birthday selected');
      return;
    }

    const profile: ChildProfile = {
      id: existingProfile?.id || `child-${Date.now()}`,
      name: name.trim(),
      birthday,
      sex,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(profile);
    handleClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-100 via-pink-100 to-sky-100 p-6 border-b-2 border-white/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">👶</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text">
                  {existingProfile ? 'Edit' : 'Add'} Child Profile
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  For personalized WHO nutrition tracking
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              👶 Child's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sophie"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-violet-500 focus:outline-none text-lg"
              autoFocus
            />
          </div>

          {/* Birthday Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🎂 Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Today's date as max
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-violet-500 focus:outline-none text-lg"
            />
            {agePreview && (
              <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl border border-violet-200">
                <div className="text-sm font-bold text-violet-800">Current Age: {agePreview}</div>
                <div className="text-xs text-violet-600 mt-1">{ageGroupPreview}</div>
              </div>
            )}
          </div>

          {/* Sex Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              ⚧️ Sex (for nutrition requirements)
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSex('female')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105
                  ${sex === 'female'
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-violet-100 border-2 border-pink-200'
                  }
                `}
              >
                👧 Female
              </button>
              <button
                onClick={() => setSex('male')}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105
                  ${sex === 'male'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200'
                  }
                `}
              >
                👦 Male
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Used for gender-specific nutritional requirements based on WHO guidelines
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
              ❌ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              {existingProfile ? '💾 Update' : '✨ Create'} Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}