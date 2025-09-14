import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../../Utils/api";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";

const Main = () => {
  const navigate = useNavigate();

  const { setUser, setToken, user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, []);


  // ✅ Save user mutation
  const saveUser = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/onboarding/save", payload);
      return data;
    },
    onSuccess: (response) => {

      if (response.success) {
        toast.success("User onboarded successfully!");
        setUser(response.data.user);
        setToken(response.data.token);
        navigate("/landing");
      } else {
        toast.error(response.message || "Failed to onboard");
      }
    },
    onError: (err:any) =>  {
      toast.error(err.response?.data?.message || "Failed to onboard");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);


    saveUser.mutate({
      fullName: user?.fullName,
      username: form.get("username"),
      avatarUrl: user?.avatarUrl,
      email : user?.email,
      collegeId: user?.college?.id,
      gender: form.get("gender"),
      age: form.get("age"),
    });
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Onboarding 🚀</h1>

      {user && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col space-y-4 w-full max-w-sm"
        >
          <img
            src={user?.avatarUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto"
          />
          <h2 className="text-2xl font-semibold text-center">
            {user?.fullName}
          </h2>
          <p className="text-white/80 text-center">{user?.email}</p>
           <input
            className="p-2 rounded text-white"
            defaultValue={user?.college?.name}
            disabled = {true}
          />

          <input
            name="username"
            placeholder="Username"
            className="p-2 rounded text-white"
            required
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            className="p-2 rounded text-white"
            required
          />
          <select name="gender" className="p-2 rounded text-black" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            disabled={saveUser.isPending}
            className="mt-4 px-6 py-2 bg-white text-pink-600 font-semibold rounded-lg shadow-md hover:bg-pink-100 transition-all disabled:opacity-50"
          >
            {saveUser.isPending ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Main;
