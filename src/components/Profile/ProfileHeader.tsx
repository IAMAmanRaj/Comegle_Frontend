import React from "react";
import { MdHome, MdEdit, MdOutlineKeyboardReturn } from "react-icons/md";
import { IoReturnUpBack } from "react-icons/io5";
import { ImShift } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  isEditing: boolean;
  onBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileHeader: React.FC<Props> = ({
  isEditing,
  onBack,
  onEdit,
  onSave,
  onCancel,
}) => (
  <div className="bg-white shadow-sm border-b border-gray-100">
    <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
      {/* Back/Home button */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <MdHome size={20} />
        <span>Home</span>
      </Button>

      {/* AnimatePresence for right-side buttons */}
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="editBtn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <Button
              onClick={onEdit}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <MdEdit size={16} />
              <span>Edit Profile</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="editActions"
            className="flex space-x-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <Button
              onClick={onCancel}
              className="flex items-center bg-red-700 hover:bg-red-700 w-auto"
            >
              <span className="text-md mb-1 pl-1">Close</span>
              <IoReturnUpBack />
            </Button>

            <Button
              onClick={onSave}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <span className="text-sm mb-1">Save</span>
              <ImShift size={20} />
              <MdOutlineKeyboardReturn size={30} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default ProfileHeader;
