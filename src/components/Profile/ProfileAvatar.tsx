import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IoImage, IoEye } from "react-icons/io5";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  avatar_url: string;
}

const ProfileAvatar: React.FC<Props> = ({ avatar_url }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <img
          src={avatar_url}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full mt-16 object-cover border-4 border-white shadow-lg"
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
           <DropdownMenuContent align="start" className="ml-5">
          <DropdownMenuItem className="flex items-center space-x-2"
              onClick={() => setOpen(true)}
            >
              <IoEye size={16} />
              <span>View Image</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialog for viewing image */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-4 w-auto">
            <img
              src={avatar_url}
              alt="Profile Avatar Full"
              className="w-[120px] h-[120px] rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfileAvatar;
