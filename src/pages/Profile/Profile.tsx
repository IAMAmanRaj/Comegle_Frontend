import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { api } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import ProfileEditForm from "@/components/Profile/ProfileEditForm";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileAvatar from "@/components/Profile/ProfileAvatar";
import ProfileBio from "@/components/Profile/ProfileBio";
import ProfileInfoGrid from "@/components/Profile/ProfileInfoGrid";
import ProfileSocialLinks from "@/components/Profile/ProfileSocialLinks";
import PageWrapper from "@/components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, setUser, setToken } = useAuthStore();
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
    console.log("Edit Data:", editData);
    setIsEditing(true);
  };

  // React Query mutation for saving profile
  const { mutate: saveProfile } = useMutation({
    mutationFn: async (data: ProfileData) => {
      const toastId = toast.loading("Saving profile...");
      try {
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

        // If accessToken is present, update it (transparent refresh)
        if (res.data.accessToken) {
          setToken(res.data.accessToken);
        }

        toast.dismiss(toastId);
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
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error saving profile."
      );
    },
  });

  const handleSaveProfile = () => {
    const missingFields: string[] = [];
    if (!editData.username?.trim()) missingFields.push("Username");
    if (!editData.fullName?.trim()) missingFields.push("Full Name");

    if (missingFields.length > 0) {
      toast.error(`${missingFields.join(", ")} can't be empty`);
      return;
    }

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
    setEditData((prev) => ({ ...prev, tags }));
  };

  // const handleCountryChange = (countryCode: string) => {
  //   setEditData((prev) => ({ ...prev, country: countryCode }));
  // };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isEditing && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleSaveProfile();
      }
      if (isEditing && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleSaveProfile();
      }
     
      if (isEditing && e.key === "Escape") {
        e.preventDefault();
        handleCancelEdit();
      }
    };

    if (isEditing) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isEditing]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ProfileHeader
          isEditing={isEditing}
          onBack={handleBack}
          onEdit={handleEditProfile}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
        <div className="max-w-4xl mx-auto px-3 py-8">
          <ProfileAvatar avatar_url={profileData.avatar_url} />
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileBio
                  fullName={profileData.fullName}
                  username={profileData.username}
                  bio={profileData.bio}
                  tags={profileData.tags}
                />
                <ProfileInfoGrid
                  collegeName={profileData.collegeName}
                  gender={profileData.gender}
                  email={profileData.email}
                  state={profileData.state}
                  country={profileData.country}
                />
                <ProfileSocialLinks socialLinks={profileData.socialLinks} />
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileEditForm
                  editData={editData}
                  onInputChange={handleInputChange}
                  onSocialLinkChange={handleSocialLinkChange}
                  onTagsChange={handleTagsChange}
                  // onCountryChange={handleCountryChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
