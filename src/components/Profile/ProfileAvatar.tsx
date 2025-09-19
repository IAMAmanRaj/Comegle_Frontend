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
          <DialogContent className=" w-auto">
            <img
              src={avatar_url}
              alt="Profile Avatar Full"
              className="w-[200px] h-[200px] rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfileAvatar;
