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
import {
  saveEditUserProfileSchema,
  type SaveEditUserProfilePayload,
} from "./saveEditUserProfile.schema";

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
  const saveProfileMutation = useMutation({
    mutationFn: async (data: SaveEditUserProfilePayload) => {
      const toastId = toast.loading("Saving profile...");
      try {
        const res = await api.post("/user/save", data);

        if (res.data.accessToken) setToken(res.data.accessToken);
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
          ...data.user,
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    },
    onError: (error: any) => {
      // First, check if it's a server validation error
      const serverData = error?.response?.data?.data;
      if (serverData && typeof serverData === "object") {
        // Flatten nested arrays into a single message string
        const messages = Object.values(serverData).flat().join(" & ");
        toast.error(messages);
        return;
      }

      // Otherwise fallback to server message or generic error
      const serverMessage = error?.response?.data?.message;
      toast.error(serverMessage || error?.message || "Error saving profile.");
    },
  });

  const handleSaveProfile = () => {
    // Map frontend data to Zod payload
    const payload: SaveEditUserProfilePayload = {
      full_name: editData.fullName,
      username: editData.username,
      avatar_url: editData.avatar_url,
      gender: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"].includes(
        editData.gender
      )
        ? (editData.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY")
        : undefined,
      country: editData.country,
      bio: editData.bio,
      tags: editData.tags,
      socials: editData.socialLinks,
    };

    const result = saveEditUserProfileSchema.safeParse(payload);

    if (!result.success) {
      const messages = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join(" & ");
      toast.error(messages);
      return;
    }

    saveProfileMutation.mutate(result.data);
  };

  const handleCancelEdit = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileIconChange = (newUrl: string) => {
    setEditData((prev) => ({ ...prev, avatar_url: newUrl }));
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
    console.log("Tags changed:", tags);
    setEditData((prev) => ({ ...prev, tags }));
  };

  // const handleCountryChange = (countryCode: string) => {
  //   setEditData((prev) => ({ ...prev, country: countryCode }));
  // };

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
          <ProfileAvatar
            avatar_url={profileData.avatar_url}
            isEditing={isEditing}
            onChange={handleProfileIconChange}
          />

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
