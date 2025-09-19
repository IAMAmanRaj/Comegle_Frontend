import React from "react";
import { MdEdit } from "react-icons/md";
import { IoReturnUpBack } from "react-icons/io5";
// import { ImShift } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { AiFillHome } from "react-icons/ai";

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
  <div className="bg-white fixed w-full z-50 shadow-sm border-b border-gray-100">
    <div className="max-w-4xl mx-auto pr-4 pl-2 md:px-6 py-4 flex justify-between items-center">
      {/* Back/Home button */}
     
      
        <AiFillHome onClick={onBack} size={30} className="mr-2 hover:cursor-pointer hover:text-emerald-600 transition-all duration-300 text-emerald-700 ml-2 -mt-1" />
      

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
              className="flex items-center hover:cursor-pointer space-x-2 bg-emerald-700 hover:bg-emerald-600"
            >
              <MdEdit size={16} />
              <span>Edit </span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="editActions"
            className="flex flex-row gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            >
                <Button
              onClick={onCancel}
              className="flex items-center hover:cursor-pointer bg-red-700 hover:bg-red-700 w-auto"
            >
              <span className="text-md mb-1 pl-1">Close</span>
              <IoReturnUpBack />
            </Button>
          

            <Button
              onClick={onSave}
              className=" bg-green-600 hover:cursor-pointer hover:bg-green-700"
            >
              <span className="text-sm mb-1">Save</span>
              {/* <ImShift size={20} />
              <MdOutlineKeyboardReturn size={16} /> */}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default ProfileHeader;
