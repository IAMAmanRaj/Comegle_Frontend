import React from 'react';
import { X } from 'lucide-react';
// import toast from 'react-hot-toast';
import { WiStars } from "react-icons/wi";

interface AddInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddInterestModal: React.FC<AddInterestModalProps> = ({ isOpen, onClose }) => {
  // const [interest, setInterest] = useState('');
  //  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!interest.trim()) return;

  //   setIsSubmitting(true);
    
  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     toast.success("We'll try to add your interest as quickly as possible so the next time you come here, you don't miss it and you see people in the live communities and your interest could be one of them.", {
  //       duration: 5000,
  //       style: {
  //         maxWidth: '500px',
  //       },
  //     });
      
  //     setInterest('');
  //     onClose();
  //   } catch (error) {
  //     toast.error('Failed to submit your interest. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
            Tell us what other communities you'd like to see here and we'll add it for you !
          </p>
        </div>

        {/* Form */}
        <form className="p-6">
          {/* <div className="mb-6">
            <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
              Your Interest
            </label>
            <input
              type="text"
              id="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g., Machine Learning, Cooking, Gaming..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {interest.length}/100 characters
            </p>
          </div> */}

          <div className="flex space-x-3 justify-between">
            {/* <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button> */}
            <button
  disabled
  className="flex-1 px-4 py-3 bg-emerald-800 text-white rounded-xl 
             cursor-not-allowed opacity-60 flex items-center justify-center"
>
  <span className="flex flex-row text-2xl font-bold items-center">
    Coming Soon
    <WiStars className="w-10 h-10 ml-2 mt-2 text-white" />
  </span>
</button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInterestModal;