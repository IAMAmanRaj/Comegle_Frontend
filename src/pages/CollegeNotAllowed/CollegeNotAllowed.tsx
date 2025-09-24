import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "@/lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import { useState } from "react";
import {
  Mail,
  User,
  Building2,
  Send,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  MailCheck,
  Clock,
} from "lucide-react";
import {
  type collegeNotAllowedPayload,
  collegeNotAllowedSchema,
} from "./CollegeNotAllowed.schema";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CollegeNotAllowed = () => {
  const { user } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ Mutation for request submission
  const submitCollegeRequest = useMutation({
    mutationFn: async (payload: collegeNotAllowedPayload) => {
      const { data } = await api.post("/college/request", payload);
      return data;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Request submitted successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(response.message || "Failed to submit request");
      }
    },
    onError: (err: any) => {
      const errors = err.response?.data?.data;
      if (errors) {
        const messages = Object.values(errors).flat().join(" & ");
        toast.error(messages);
      } else {
        toast.error(err.response?.data?.message || "Failed to submit request");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload: collegeNotAllowedPayload = {
      full_name: form.get("full_name")?.toString().trim() || "",
      college_email: form.get("email")?.toString().trim() || "",
      college_name: form.get("college_name")?.toString().trim() || "",
    };

    const result = collegeNotAllowedSchema.safeParse(payload);

    if (!result.success) {
      const messages = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join(" & ");
      toast.error(messages);
      return;
    }

    submitCollegeRequest.mutate(result.data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 shadow-lg">
            <div className="mx-auto w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-700 mb-4">
              Request Submitted Successfully!
            </h1>
            <p className="text-emerald-600 mb-6">
              Thank you for your request. Our team will review your college
              information and get back to you within 2-3 business days.
            </p>
            <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-600">
                You'll receive an email confirmation once your college is
                approved.
              </p>
            </div>

            {/* Redirect back to landing page */}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-0 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg  transition"
            >
              Go back to comegle.live
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-10">
        {/* Back Button */}
        <div className="mb-6 w-full flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="mx-auto w-8 h-8  sm:w-20 sm:h-20 bg-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <AlertCircle className="w-8 h-8  sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-700 mb-4">
            College Access Required
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
            Your college isn't currently in our approved list. Please provide
            your details below and we'll review your request to add your
            institution.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-700 px-8 py-3 sm:py-6">
            <h2 className="text-base sm:text-xl font-semibold text-white flex items-center gap-3">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
              Request College Access
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  <input
                    name="full_name"
                    type="text"
                    defaultValue={user?.full_name}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  College Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  <input
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* College Name */}
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                College/University Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-emerald-500" />
                <textarea
                  name="college_name"
                  rows={3}
                  placeholder="Example: Indian Institute of Technology Delhi (IITD)"
                  className="w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitCollegeRequest.isPending}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitCollegeRequest.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Access Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* What happens next */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">
            What happens next?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-emerald-700">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 md:w-12  text-emerald-600 mt-1" />
              <p>
                Our team will review your request and verify your college
                details within <span className="font-medium">2-3 days</span>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MailCheck className="w-5 h-6 md:w-10  text-emerald-600 mt-1" />
              <p>
                You’ll get an{" "}
                <span className="font-medium">
                  email update once your college is approved.
                </span>{" "}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="w-6 h-6 md:w-12  text-emerald-600 mt-1" />
              <p>
                After approval, you can{" "}
                <span className="font-medium">access all features</span> with
                your college account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeNotAllowed;
