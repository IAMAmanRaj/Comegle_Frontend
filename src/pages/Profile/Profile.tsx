import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdHome, MdEdit, MdSave, MdCancel } from "react-icons/md";
import { IoEye, IoImage } from "react-icons/io5";
import {
  FaBriefcase,
  FaUser,
  FaEnvelope,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountryDropdown } from "@/components/ui/CountrySelect";
import TagsInput from "@/components/ui/TagsInput";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

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

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Use user from Zustand as the single source of truth for profile data
  const profileData: ProfileData = {
    avatar_url: user?.avatar_url || "",
    username: user?.username || "",
    fullName: user?.full_name || "",
    collegeName: user?.college?.name || "",
    email: user?.email || "",
    state: user?.college?.state || "",
    country: user?.college?.country || "India",
    gender: user?.gender || "",
    bio: user?.bio || "",
    tags: user?.tags || [],
    socialLinks: {
      linked_in: user?.socialLinks?.linked_in || "",
      twitter: user?.socialLinks?.twitter || "",
      instagram: user?.socialLinks?.instagram || "",
    },
  };

  // Local edit data only for edit mode, initialized from Zustand user
  const [editData, setEditData] = useState<ProfileData>(profileData);

  useEffect(() => {
    setEditData(profileData);
    // eslint-disable-next-line
  }, [user]);

  const handleBack = () => {
    navigate("/landing");
  };

  const handleEditProfile = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  // React Query mutation for saving profile
  const { mutate: saveProfile } = useMutation({
      mutationFn: async (data: ProfileData) => {
          
           // Validate required fields
    if (!data.username?.trim() || !data.fullName?.trim() || !data.gender?.trim()) {
        toast.error("Username, Full Name, and Gender are required.");
        return;
      throw new Error("Missing required profile fields.");
          }
          
      // Show loading toast (returns an id to update later)
      const toastId = toast.loading("Saving profile...");
      try {
        // Build payload as per backend expects
        const payload: any = {
          avatar_url: data.avatar_url,
          username: data.username,
          full_name: data.fullName,
          gender: data.gender,
            country: data.country,
            bio: data.bio,
            tags: data.tags,
            socials: { ...data.socialLinks },
        };
       
        const res = await api.post("/user/save", payload);
          toast.dismiss(toastId);
          console.log("Profile save response:", res.data.user);
        setUser(res.data.user);
        return res.data;
      } catch (error: any) {
        toast.dismiss(toastId);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setUser({
          ...user,
          avatar_url: data.user.avatar_url,
          username: data.user.username,
          full_name: data.user.full_name,
          gender: data.user.gender,
          country: data.user.country,
          bio: data.user.bio,
          tags: data.user.tags,
          socialLinks: data.user.socialLinks,
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error saving profile.");
    },
  });

  const handleSaveProfile = () => {
    saveProfile(editData);
  };

  const handleCancelEdit = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (
    platform: keyof ProfileData["socialLinks"],
    value: string
  ) => {
    setEditData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

    const handleTagsChange = (tags: string[]) => {
      console.log("Updated tags:", tags);
    setEditData((prev) => ({ ...prev, tags }));
  };

  const handleCountryChange = (countryCode: string) => {
    setEditData((prev) => ({ ...prev, country: countryCode }));
  };

  // Remove isSaving from useEffect dependency
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isEditing) {
        e.preventDefault();
        handleSaveProfile();
      }
    };
    if (isEditing) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isEditing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <MdHome size={20} />
            <span>Home</span>
          </Button>
          {!isEditing ? (
            <Button
              onClick={handleEditProfile}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <MdEdit size={16} />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelEdit}
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <MdCancel size={16} />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <MdSave size={16} />
                <span>Save Changes</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Avatar Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={profileData.avatar_url}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full p-2 h-auto"
                >
                  <IoImage size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <IoEye size={16} />
                  <span>View Image</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2">
                  <MdEdit size={16} />
                  <span>Edit Image</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!isEditing ? (
          // View Mode
          <div className="space-y-8">
            {/* Bio Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.fullName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                @{profileData.username}
              </p>
              <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
                {profileData.bio}
              </p>
              {/* Tags Display */}
              {profileData.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {profileData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaBriefcase className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">College</p>
                    <p className="font-semibold text-gray-900">
                      {profileData.collegeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FaUser className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {profileData.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaEnvelope className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {profileData.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <FaMapMarkedAlt className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {profileData.state}, {profileData.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Social Links
              </h3>
              <div className="flex justify-center space-x-6">
                {!profileData.socialLinks.linked_in &&
                !profileData.socialLinks.twitter &&
                !profileData.socialLinks.instagram ? (
                  <p className="text-gray-500">No social links added yet.</p>
                ) : (
                  <>
                    {profileData.socialLinks.linked_in && (
                      <a
                        href={profileData.socialLinks.linked_in}
                        className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg transition-colors"
                      >
                        <FaLinkedin className="text-blue-600" size={24} />
                      </a>
                    )}
                    {profileData.socialLinks.twitter && (
                      <a
                        href={profileData.socialLinks.twitter}
                        className="bg-sky-100 hover:bg-sky-200 p-3 rounded-lg transition-colors"
                      >
                        <FaTwitter className="text-sky-600" size={24} />
                      </a>
                    )}
                    {profileData.socialLinks.instagram && (
                      <a
                        href={profileData.socialLinks.instagram}
                        className="bg-pink-100 hover:bg-pink-200 p-3 rounded-lg transition-colors"
                      >
                        <FaInstagram className="text-pink-600" size={24} />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-8">
            {/* Basic Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Profile
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
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
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select
                    value={editData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <CountryDropdown
                    placeholder="Select country"
                    defaultValue={editData.country}
                    onChange={(country) => handleCountryChange(country.alpha3)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags/Interests
                  </label>
                  <TagsInput
                    tags={editData.tags}
                    onChange={handleTagsChange}
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
                    onChange={(e) => handleInputChange("bio", e.target.value)}
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
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaLinkedin className="text-blue-600" size={20} />
                  </div>
                  <Input
                    type="url"
                    value={editData.socialLinks.linked_in}
                    onChange={(e) =>
                      handleSocialLinkChange("linked_in", e.target.value)
                    }
                    placeholder="LinkedIn profile URL"
                    className="flex-1 h-12"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-sky-100 p-2 rounded-lg">
                    <FaTwitter className="text-sky-600" size={20} />
                  </div>
                  <Input
                    type="url"
                    value={editData.socialLinks.twitter}
                    onChange={(e) =>
                      handleSocialLinkChange("twitter", e.target.value)
                    }
                    placeholder="Twitter profile URL"
                    className="flex-1 h-12"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <FaInstagram className="text-pink-600" size={20} />
                  </div>
                  <Input
                    type="url"
                    value={editData.socialLinks.instagram}
                    onChange={(e) =>
                      handleSocialLinkChange("instagram", e.target.value)
                    }
                    placeholder="Instagram profile URL"
                    className="flex-1 h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
