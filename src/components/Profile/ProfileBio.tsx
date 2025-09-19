import React from "react";

interface Props {
  fullName: string;
  username: string;
  bio: string;
  tags: string[];
}

const ProfileBio: React.FC<Props> = ({ fullName, username, bio, tags }) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
    <p className="text-lg text-gray-600 mb-4">@{username}</p>
    <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">{bio}</p>
    {tags.length > 0 && (
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{tag}</span>
        ))}
      </div>
    )}
  </div>
);

export default ProfileBio;