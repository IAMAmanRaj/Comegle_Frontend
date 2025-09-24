import React, { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IoImage, IoEye } from "react-icons/io5";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IKContext, IKUpload } from "imagekitio-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/utils"; // your axios instance

const URL_ENDPOINT = import.meta.env.VITE_IMAGE_KIT_URL_ENDPOINT as string;
const PUBLIC_KEY = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY as string;

interface Props {
  avatar_url: string;
  isEditing?: boolean;
  onChange?: (newUrl: string) => void; // <-- Add this line
}

const ProfileAvatar: React.FC<Props> = ({
  avatar_url,
  onChange,
  isEditing,
}) => {
  const [open, setOpen] = useState(false);
  const [imagePath, setImagePath] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<any>(null);

  // Store toast id for updating/dismissing
  const toastIdRef = useRef<string | null>(null);

  // ImageKit authenticator using your backend
  const authenticator = async () => {
    try {
      setIsUploading(true);
      // Show persistent uploading toast (no duration, stays until dismissed)
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading("Uploading Image...");
      }
      const response = await api.get("/user/image/auth");
      const { signature, expire, token } = response.data;
      return { signature, expire, token };
    } catch (error: any) {
      if (toastIdRef.current) {
        toast.error(
          "Image upload failed: " +
            (error.response?.data?.message || error.message),
          { id: toastIdRef.current }
        );
        toastIdRef.current = null;
      }
      setIsUploading(false);
      throw error;
    }
  };

  // Handle upload success
  const handleUploadSuccess = async (res: any) => {
    setIsUploading(false);
    setImagePath(res.url);
    if (toastIdRef.current) {
      toast.success("Upload successful!", { id: toastIdRef.current });
      // Assign null to ref only after upload completes
      toastIdRef.current = null;
    }
    if (onChange) {
      onChange(res.url);
    }
  };

  // Handle upload error
  const handleUploadError = (err: any) => {
    setIsUploading(false);
    if (toastIdRef.current) {
      toast.error("Image upload failed: " + (err?.message || "Unknown error"), {
        id: toastIdRef.current,
      });
      toastIdRef.current = null;
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <img
          src={imagePath || avatar_url}
          alt="Profile Avatar"
          className="w-28 h-28 rounded-full mt-16 object-cover border-2 border-white shadow-lg"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="absolute bottom-2 right-2 bg-emerald-700 hover:bg-emerald-600 hover:cursor-pointer shadow-lg rounded-full p-2 h-auto"
            >
              <IoImage size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="ml-12 -mt-10">
            <DropdownMenuItem
              className="flex flex-col"
              onClick={() => setOpen(true)}
            >
              <span className="flex justify-center items-center gap-2 hover:cursor-pointer">
                View <IoEye size={16} className="mt-1" />
              </span>
            </DropdownMenuItem>

            {isEditing && (
              <DropdownMenuItem
                className="flex justify-center hover:cursor-pointer"
                onClick={handleUploadClick}
              >
                <span>Upload New</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden ImageKit Upload input */}
        <IKContext
          urlEndpoint={URL_ENDPOINT}
          publicKey={PUBLIC_KEY}
          authenticator={authenticator}
        >
          <IKUpload
            ref={fileInputRef}
            className="hidden"
            fileName="profile-avatar.png"
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            useUniqueFileName={true}
          />
        </IKContext>

        {/* Dialog for viewing image */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-auto">
            <img
              src={imagePath || avatar_url}
              alt="Profile Avatar Full"
              className="w-[200px] h-[200px] rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </div>
      {isUploading && (
        <div className="mt-4 text-sm text-gray-500">Uploading...</div>
      )}
    </div>
  );
};

export default ProfileAvatar;
