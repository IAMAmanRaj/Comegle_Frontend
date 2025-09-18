import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { IoEye, IoImage } from 'react-icons/io5';
import { FaBriefcase, FaUser, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CountryDropdown } from '@/components/ui/CountrySelect';
import TagsInput from '@/components/ui/TagsInput';
import { useAuthStore, type User } from "../../store/useAuthStore";

interface ProfileData {
  avatar_url: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  collegeName: string;
  email: string;
  state: string;
  country: string;
  gender: string;
  bio: string;
  pronouns: string;
  tags: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
  };
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Set profileData based on user from authStore
  const initialProfileData: ProfileData = {
    avatar_url: user?.avatar_url || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    username: user?.username || 'alex_chen',
    firstName: user?.full_name?.split(" ")[0] || 'Alex',
    lastName: user?.full_name?.split(" ").slice(1).join(" ") || 'Chen',
    fullName: user?.full_name || 'Alex Chen',
    collegeName: user?.college?.name || 'Stanford University',
    email: user?.email || 'alex.chen@example.com',
    state: user?.college?.state || 'California',
    country: user?.college?.country || 'USA',
    gender: user?.gender || 'non-binary',
    bio: 'Computer Science student passionate about AI and machine learning. Love connecting with people worldwide!',
    pronouns: 'they/them',
    tags: ['Machine Learning', 'AI', 'React', 'TypeScript', 'Computer Science'],
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  };

  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Sync profileData with authStore user, when user changes
    setProfileData({
      avatar_url: user?.avatar_url || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      username: user?.username || 'alex_chen',
      firstName: user?.full_name?.split(" ")[0] || 'Alex',
      lastName: user?.full_name?.split(" ").slice(1).join(" ") || 'Chen',
      fullName: user?.full_name || 'Alex Chen',
      collegeName: user?.college?.name || 'Stanford University',
      email: user?.email || 'alex.chen@example.com',
      state: user?.college?.state || 'California',
      country: user?.college?.country || 'USA',
      gender: user?.gender || 'non-binary',
      bio: profileData.bio,
      pronouns: profileData.pronouns,
      tags: profileData.tags,
      socialLinks: profileData.socialLinks
    });
    setEditData(profileData);
    // eslint-disable-next-line
  }, [user]);

  const handleBack = () => {
    navigate('/landing');
  };

  const handleEditProfile = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    setProfileData(editData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (field === 'firstName' || field === 'lastName') {
      const newData = { ...editData, [field]: value };
      newData.fullName = `${newData.firstName} ${newData.lastName}`;
      setEditData(newData);
    } else {
      setEditData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSocialLinkChange = (platform: keyof ProfileData['socialLinks'], value: string) => {
    setEditData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setEditData(prev => ({ ...prev, tags }));
  };

  const handleCountryChange = (countryCode: string) => {
    setEditData(prev => ({ ...prev, country: countryCode }));
  };

  // Keyboard listener for Enter key on Save button
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isEditing && !isSaving) {
        e.preventDefault();
        handleSaveProfile();
      }
    };
    if (isEditing) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isEditing, isSaving]);

  const getCountryLabel = (country: string) => {
    // You can expand this list as needed
    const countries = [
      { value: 'USA', label: 'United States', flag: '🇺🇸' },
      { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
      { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
      { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
      { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
      { value: 'France', label: 'France', flag: '🇫🇷' },
      { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
      { value: 'India', label: 'India', flag: '🇮🇳' },
      { value: 'Brazil', label: 'Brazil', flag: '🇧🇷' },
      { value: 'Mexico', label: 'Mexico', flag: '🇲🇽' },
      { value: 'Italy', label: 'Italy', flag: '🇮🇹' },
      { value: 'Spain', label: 'Spain', flag: '🇪🇸' },
      { value: 'Netherlands', label: 'Netherlands', flag: '🇳🇱' },
      { value: 'Sweden', label: 'Sweden', flag: '🇸🇪' },
    ];
    const countryObj = countries.find(c => c.value === country);
    return countryObj ? countryObj.label : country;
  };

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
                disabled={isSaving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <MdSave size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.fullName}</h1>
              <p className="text-lg text-gray-600 mb-4">@{profileData.username}</p>
              <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">{profileData.bio}</p>
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
                    <p className="font-semibold text-gray-900">{profileData.collegeName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FaUser className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900 capitalize">{profileData.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaEnvelope className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <FaMapMarkerAlt className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">{profileData.state}, {getCountryLabel(profileData.country)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Social Links</h3>
              <div className="flex justify-center space-x-6">
                {profileData.socialLinks.linkedin && (
                  <a href={profileData.socialLinks.linkedin} className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg transition-colors">
                    <FaLinkedin className="text-blue-600" size={24} />
                  </a>
                )}
                {profileData.socialLinks.twitter && (
                  <a href={profileData.socialLinks.twitter} className="bg-sky-100 hover:bg-sky-200 p-3 rounded-lg transition-colors">
                    <FaTwitter className="text-sky-600" size={24} />
                  </a>
                )}
                {profileData.socialLinks.instagram && (
                  <a href={profileData.socialLinks.instagram} className="bg-pink-100 hover:bg-pink-200 p-3 rounded-lg transition-colors">
                    <FaInstagram className="text-pink-600" size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-8">
            {/* Basic Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Profile</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <Input
                    type="text"
                    value={editData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Pronouns</label>
                  <Select value={editData.pronouns} onValueChange={(value) => handleInputChange('pronouns', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he/him">he/him</SelectItem>
                      <SelectItem value="she/her">she/her</SelectItem>
                      <SelectItem value="they/them">they/them</SelectItem>
                      <SelectItem value="prefer not to say">prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                  <Input
                    type="text"
                    value={editData.collegeName}
                    onChange={(e) => handleInputChange('collegeName', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <Select value={editData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <CountryDropdown
                    placeholder="Select country"
                    defaultValue={editData.country}
                    onChange={(country) => handleCountryChange(country.alpha3)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <Input
                    type="text"
                    value={editData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="h-12"
                    placeholder="Enter your state or province"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags/Interests</label>
                  <TagsInput
                    tags={editData.tags}
                    onChange={handleTagsChange}
                    placeholder="Add your interests and skills (press Enter to add)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Press Enter to add tags. Click × to remove them.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brief Bio</label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
            {/* Social Links Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Social Media Links</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaLinkedin className="text-blue-600" size={20} />
                  </div>
                  <Input
                    type="url"
                    value={editData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
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
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
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
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
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