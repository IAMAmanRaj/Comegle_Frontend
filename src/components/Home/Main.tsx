import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../Utils/api";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (credential: string) => {
      const res = await api.post("/auth/google/verify", { credential });
      return res.data;
    },
    onSuccess: (response) => {
      // ✅ Redirect logic
      if (response.message.includes("already exists")) {
        // ✅ Save user in zustand
        setUser(response.data.user);
        setToken(response.data.token);
        navigate("/landing");
        toast.success("Welcome back!");
      } else if (response.message.includes("College allowed")) {
        setUser(response.data.user);
        setToken(null);
        navigate("/onboarding");
        toast.success(response.message);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Authentication failed");
      if (err.response?.status === 403) {
  
        setUser(err.response?.data?.data?.user || null); 
        navigate("/collegenotallowed");
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 flex flex-col justify-center items-center px-4 text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-white/10 px-6 py-3 rounded-xl shadow-md backdrop-blur-md">
        ✨ Comegle
      </h1>

      <div className="rounded-2xl w-full max-w-md aspect-video border-4 border-white/30 shadow-xl flex flex-col items-center justify-center bg-black/40">
        <span className="text-white/70 text-lg mb-4">
          🔒 Sign in to use video chat
        </span>
        <GoogleLogin
          onSuccess={(res) => res.credential && mutation.mutate(res.credential)}
          onError={() => toast.error("Google Login Failed")}
        />
      </div>

      <p className="mt-6 text-lg text-white/90 text-center">
        Welcome to <span className="font-semibold">Comegle</span>! Sign in to
        start connecting with strangers through live video chat.
      </p>
    </div>
  );
};

export default Main;
