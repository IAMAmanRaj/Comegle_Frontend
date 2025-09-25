import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { CountryDropdown } from "@/components/ui/CountrySelect";
import TagsInput from "@/components/ui/TagsInput";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

interface ProfileData {
  avatar_url: string;
  username: string;
  fullName: string;
  collegeName: string;
  email: string;
  country: string;
  state: string;
  gender: string;
  bio: string;
  tags: string[];
  socialLinks: {
    linked_in: string;
    twitter: string;
    instagram: string;
  };
}

interface ProfileEditFormProps {
  editData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string) => void;
  onSocialLinkChange: (
    platform: keyof ProfileData["socialLinks"],
    value: string
  ) => void;
  onTagsChange: (tags: string[]) => void;
//   onCountryChange: (countryCode: string) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  editData,
  onInputChange,
  onSocialLinkChange,
  onTagsChange,
//   onCountryChange,
}) => (
   
  <div className="space-y-8">
    {/* Basic Profile Section */}
        <div className="bg-white relative rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="w-full  flex flex-row justify-between">
 <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Basic Profile
        </h3>
        {/* <div className="flex flex-col absolute top-6 right-8">
<h3 className="text-sm hidden lg:block font-semibold text-gray-700 mb-2">
                    {`Hit Shift + Enter To Save`}
        </h3>
           <h3 className="text-sm hidden lg:block font-semibold text-gray-700 mb-6">
                    {`Hit Esc To Close`}
                </h3>
        </div> */}
                
                
            </div>
     
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <Input
            type="text"
            value={editData.username}
            onChange={e =>
              onInputChange("username", e.target.value)
            }
            className="h-12"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <Input
            type="text"
            value={editData.fullName}
            onChange={e =>
              onInputChange("fullName", e.target.value)
            }
            className="h-12"
          />
        </div>
        <div className="flex items-center flex-row gap-2">
          <label className="mt-2 text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <Select
                        value={editData.gender}
            onValueChange={value => onInputChange("gender", value)}
          >
            <SelectTrigger className="h-12 w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">
                Prefer Not To Say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <CountryDropdown
            placeholder="Select country"
            defaultValue={editData.country}
            onChange={country => onCountryChange(country.alpha3)}
          />
        </div> */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags/Interests
          </label>
          <TagsInput
            tags={editData.tags}
            onChange={onTagsChange}
            placeholder="Add your interests and skills (press Enter to add)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Press Enter to add tags. Click × to remove them.
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brief Bio
          </label>
          <Textarea
            value={editData.bio}
            onChange={e =>
              onInputChange("bio", e.target.value)
            }
            rows={4}
            className="resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
    {/* Social Links Section */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
  <h3 className="text-xl font-semibold text-gray-900 mb-6">
    Social Media Links
  </h3>
  <div className="space-y-4">
    {/* LinkedIn */}
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 p-2 rounded-lg">
        <FaLinkedin className="text-blue-600" size={20} />
      </div>
      <Input
        type="url"
        value={editData.socialLinks.linked_in}
        onChange={e => onSocialLinkChange("linked_in", e.target.value)}
        placeholder="LinkedIn profile URL"
        className="flex-1 h-12"
      />
      {editData.socialLinks.linked_in && (
        <button
          type="button"
          onClick={() => onSocialLinkChange("linked_in", "")}
          className="text-red-500 hover:text-red-700"
          title="Remove LinkedIn"
        >
          <MdDelete size={22} />
        </button>
      )}
    </div>

    {/* Twitter */}
    <div className="flex items-center space-x-3">
      <div className="bg-sky-100 p-2 rounded-lg">
        <FaTwitter className="text-sky-600" size={20} />
      </div>
      <Input
        type="url"
        value={editData.socialLinks.twitter}
        onChange={e => onSocialLinkChange("twitter", e.target.value)}
        placeholder="Twitter profile URL"
        className="flex-1 h-12"
      />
      {editData.socialLinks.twitter && (
        <button
          type="button"
          onClick={() => onSocialLinkChange("twitter", "")}
          className="text-red-500 hover:text-red-700"
          title="Remove Twitter"
        >
          <MdDelete size={22} />
        </button>
      )}
    </div>

    {/* Instagram */}
    <div className="flex items-center space-x-3">
      <div className="bg-pink-100 p-2 rounded-lg">
        <FaInstagram className="text-pink-600" size={20} />
      </div>
      <Input
        type="url"
        value={editData.socialLinks.instagram}
        onChange={e => onSocialLinkChange("instagram", e.target.value)}
        placeholder="Instagram profile URL"
        className="flex-1 h-12"
      />
      {editData.socialLinks.instagram && (
        <button
          type="button"
          onClick={() => onSocialLinkChange("instagram", "")}
          className="text-red-500 hover:text-red-700"
          title="Remove Instagram"
        >
          <MdDelete size={22} />
        </button>
      )}
    </div>
  </div>
</div>

  </div>
);

export default ProfileEditForm;