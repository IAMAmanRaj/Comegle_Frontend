import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { WiStars } from "react-icons/wi";
import { api } from "@/lib/utils";
import {
  addCommunityToWaitListSchema,
} from "@/pages/Landing/Communities.schema";

interface AddInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddInterestModal: React.FC<AddInterestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [community_name, setCommunityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = addCommunityToWaitListSchema.safeParse({ community_name });
    if (!result.success) {
      // show validation errors immediately
      const messages = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join(" & ");
      toast.error(messages);
      return; // stop here, don’t call API
    }

     setIsSubmitting(true);

    const loadingToast = toast.loading("Submitting your interest...");

    try {
      // Use POST and send community_name in the body
      const res = await api.post("/communities/add", {
        community_name,
      });

      if (res?.data?.success) {
        toast.success("Request Submitted Successfully", {
          id: loadingToast,
          duration: 5000,
          style: {
            maxWidth: "500px",
          },
        });
        onClose();
      } else {
        toast.error(res?.data?.message || "Request Failed. Please try again.", {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Request Failed. Please try again.",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Your Interest
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-50 hover:cursor-pointer rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Tell us what other communities you'd like to see here and we'll add
            it for you !
          </p>
        </div>

        {/* Form */}
        <form className="p-6" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="interest"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Interest
            </label>
            <input
              type="text"
              id="interest"
              value={community_name}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="e.g., Machine Learning, Cooking, Gaming..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all duration-200"
              maxLength={100}
              disabled={isSubmitting}
            />
          
            <p className={`text-sm mt-1 ${community_name.length > 30 ? "text-red-700" : "text-gray-500"}`}>
              {community_name.length}/30 characters
            </p>
          </div>

          <div className="flex space-x-3 justify-between items-end">
            <button
              type="button"
              onClick={onClose}
              className="w-[120px] h-[50px] text-lg hover:cursor-pointer text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-[170px] h-[50px] bg-emerald-700 hover:cursor-pointer text-white rounded-xl flex items-center justify-center`}
            >
              {isSubmitting ? (
                <span className="flex justify-center w-[300px] flex-row text-lg font-bold items-center">
                  Submitting
                  <WiStars className="w-8 h-8 mt-1 ml-1 text-white animate-spin transition-all duration-300" />
                </span>
              ) : (
                <span className="flex pl-4 w-[280px] justify-center flex-row  text-lg font-bold items-center">
                  Submit
                  <WiStars className="w-10 h-10  mt-2 text-white" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInterestModal;
