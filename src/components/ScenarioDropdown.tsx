import { useState } from 'react';
import { ScenarioPreset } from '../types';

interface ScenarioDropdownProps {
  presets: ScenarioPreset[];
  onSelectPreset: (preset: ScenarioPreset) => void;
}

export default function ScenarioDropdown({ presets, onSelectPreset }: ScenarioDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (preset: ScenarioPreset) => {
    onSelectPreset(preset);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>Load Scenario</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(preset)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-600"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
