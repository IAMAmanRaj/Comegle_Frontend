import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface ConfigureMatchingProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: {
    selectedStates: string[] | "*";
    country: string;
    collegeState: string;
    preferredGender: "male" | "female" | "any";
  };
  onSave: (preferences: {
    selectedStates: string[] | "*";
    country: string;
    collegeState: string;
    preferredGender: "male" | "female" | "any";
  }) => void;
}

const ALL_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const ConfigureMatching: React.FC<ConfigureMatchingProps> = ({
  isOpen,
  onClose,
  currentPreferences,
  onSave,
}) => {
  const [selectedStates, setSelectedStates] = useState(
    currentPreferences.selectedStates
  );
  const [preferredGender, setPreferredGender] = useState(
    currentPreferences.preferredGender
  );

  if (!isOpen) return null;

  const toggleState = (state: string) => {
    setSelectedStates((prev) => {
      if (prev === "*") {
        return ALL_STATES.filter((s) => s !== state);
      }
      return prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state];
    });
  };

  const selectAll = () => {
    setSelectedStates(ALL_STATES);
  };

  const clearAll = () => {
    setSelectedStates([]);
  };

  const handleSave = () => {
    onSave({
      selectedStates:
        selectedStates.length === ALL_STATES.length ? "*" : selectedStates,
      country: currentPreferences.country,
      collegeState: currentPreferences.collegeState,
      preferredGender,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configure Matching Preferences
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Choose which states you'd like to connect with students from. Your
              country ({currentPreferences.country}) is selected by default.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">All Regions</h3>
              <div className="flex space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* States Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ALL_STATES.map((state) => (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                    selectedStates.includes(state) || selectedStates === "*"
                      ? "bg-blue-50 border-blue-500 text-blue-900"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{state}</span>
                    {selectedStates.includes(state) ||
                    selectedStates === "*" ? (
                      <Check className="w-4 h-4 text-blue-600" />
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected States */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Selected: {selectedStates === "*" ? ALL_STATES.length : selectedStates.length} regions</strong>
            </p>
            {selectedStates !== "*" && selectedStates.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedStates.slice(0, 10).map((state) => (
                  <span
                    key={state}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {state}
                  </span>
                ))}
                {selectedStates.length > 10 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    +{selectedStates.length - 10} more
                  </span>
                )}
              </div>
            )}
            {selectedStates === "*" && (
              <div className="flex flex-wrap gap-1">
                {ALL_STATES.slice(0, 10).map((state) => (
                  <span
                    key={state}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {state}
                  </span>
                ))}
                {ALL_STATES.length > 10 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    +{ALL_STATES.length - 10} more
                  </span>
                )}

              </div>
            )}
    
          </div>

          {/* Gender Selection */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Preferred Gender</h3>
            <div className="flex space-x-3">
              {["male", "female", "any"].map((gender) => (
                <button
                  key={gender}
                  onClick={() =>
                    setPreferredGender(gender as "male" | "female" | "any")
                  }
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    preferredGender === gender
                      ? "bg-blue-50 border-blue-500 text-blue-900"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureMatching;
