import React from "react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

interface Props {
  socialLinks: {
    linked_in: string;
    twitter: string;
    instagram: string;
  };
}

const ProfileSocialLinks: React.FC<Props> = ({ socialLinks }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <h3 className="text-xl font-semibold text-gray-900 mb-6">Social Links</h3>
    <div className="flex justify-center space-x-6">
      {!socialLinks.linked_in && !socialLinks.twitter && !socialLinks.instagram ? (
        <p className="text-gray-500">No social links added yet.</p>
      ) : (
        <>
          {socialLinks.linked_in && (
            <a
              href={socialLinks.linked_in}
              className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg transition-colors"
            >
              <FaLinkedin className="text-blue-600" size={24} />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              className="bg-sky-100 hover:bg-sky-200 p-3 rounded-lg transition-colors"
            >
              <FaTwitter className="text-sky-600" size={24} />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              className="bg-pink-100 hover:bg-pink-200 p-3 rounded-lg transition-colors"
            >
              <FaInstagram className="text-pink-600" size={24} />
            </a>
          )}
        </>
      )}
    </div>
  </div>
);

export default ProfileSocialLinks;