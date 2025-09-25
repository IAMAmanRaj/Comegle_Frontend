import React from "react";
import { FaBriefcase, FaUser, FaEnvelope, FaMapMarkedAlt } from "react-icons/fa";

interface Props {
  collegeName: string;
  gender: string;
  email: string;
  state: string;
  country: string;
}

const ProfileInfoGrid: React.FC<Props> = ({
  collegeName,
  gender,
  email,
  state,
  country,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 mb-4">
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FaBriefcase className="text-blue-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">College</p>
          <p className="font-semibold text-gray-900">{collegeName}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-purple-100 p-2 rounded-lg">
          <FaUser className="text-purple-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p className="font-semibold text-gray-900 capitalize">{gender.toLowerCase().split("_").join(" ")}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <FaEnvelope className="text-green-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="bg-orange-100 p-2 rounded-lg">
          <FaMapMarkedAlt className="text-orange-600" size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-semibold text-gray-900">{state}, {country}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileInfoGrid;