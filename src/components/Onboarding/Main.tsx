import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "@/lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";
import {
  userOnboardingSchema,
  type userOnboardingPayload,
} from "../../pages/Onboarding/Onboarding.schema";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

const Main = () => {
  const navigate = useNavigate();

  const { setUser, setToken, user } = useAuthStore();

  useEffect(() => {
    if (!user?.college) {
      navigate("/");
    }
  }, []);

  // ✅ Save user mutation
  const saveUser = useMutation({
    mutationFn: async (payload: userOnboardingPayload) => {
      const { data } = await api.post("/onboarding/save", payload);
      return data;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("User onboarded successfully!");
        setUser(response.data.user);
        setToken(response.data.accessToken);
        navigate("/landing");
      } else {
        toast.error(response.message || "Failed to onboard");
      }
    },
    onError: (err: any) => {
      const errors = err.response?.data?.data;
      if (errors) {
        // Flatten field errors into a string
        const messages = Object.values(errors).flat().join(" & ");
        toast.error(messages);
      } else {
        toast.error(err.response?.data?.message || "Failed to onboard");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      full_name: user?.full_name,
      username: form.get("username"),
      avatar_url: user?.avatar_url,
      email: user?.email,
      college_id: user?.college?.id,
      gender: form.get("gender")?.toString().trim(),
      age: Number(form.get("age")),
    };

    const result = userOnboardingSchema.safeParse(payload);

    if (!result.success) {
      // show validation errors immediately
      const messages = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .join(" & ");
      toast.error(messages);
      return; // stop here, don’t call API
    }

    saveUser.mutate(result.data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-100 text-white px-4">
      <h1 className="text-2xl sm:text-3xl text-emerald-600 font-bold mb-6">Welcome to Onboarding 🚀</h1>

      {user && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col space-y-4 w-full max-w-sm"
        >
          <img
            src={user?.avatar_url}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto"
          />
          <h2 className="text-2xl font-semibold text-center text-gray-700">
            {user?.full_name}
          </h2>
          <p className="text-center text-gray-700">{user?.email}</p>
          <input
            className="p-2 rounded text-gray-700"
            defaultValue={user?.college?.name}
            disabled={true}
          />

          <Input
            name="username"
            placeholder="Username"
            className="p-2 rounded font-bold text-gray-700"
            required
          />
          <Input
            name="age"
            type="number"
            placeholder="Age"
            className="p-2 rounded font-bold text-gray-700"
            required
          />
          
         {/* Gender Select */}
<Select name="gender" required>
  <SelectTrigger className="w-full data-[placeholder]:text-gray-400 bg-gray-700">
    <SelectValue placeholder="Select Gender"  />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Male" className="text-gray-700">Male</SelectItem>
    <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
               <SelectItem value="Other">Prefer Not To Say</SelectItem>
  </SelectContent>
</Select>

          <button
            type="submit"
            disabled={saveUser.isPending}
            className="mt-4 px-6 py-2 text-white bg-emerald-700 hover:bg-emerald-600 font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
          >
            {saveUser.isPending ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Main;
