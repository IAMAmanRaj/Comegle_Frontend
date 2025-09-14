import { useEffect, useRef, useState } from "react";
import { api } from "../../Utils/api";
import Room from "./Room";
import { useAuthStore, type User } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Main = () => {
  const { user } = useAuthStore();
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const getCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);

    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      videoRef.current.play();
    }
  };

  useEffect(() => {
    getCam();
  }, []);

  useEffect(() => {
    if (!joined && videoRef.current && localVideoTrack) {
      videoRef.current.srcObject = new MediaStream([localVideoTrack]);
      videoRef.current.play();
    }
  }, [joined, localVideoTrack]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out!");
    } catch (err) {
      toast.error("Failed to log out");
    }
    setUser(null);
    setToken(null);
    navigate("/");
  };

  if (!joined) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 flex flex-col justify-center items-center px-4 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-white/10 px-6 py-3 rounded-xl shadow-md backdrop-blur-md">
          ✨ Comegle
        </h1>
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
          >
            🚪 Logout
          </button>
        </div>

        <video
          autoPlay
          ref={videoRef}
          className="rounded-2xl w-full max-w-md aspect-video border-4 border-white/30 shadow-xl"
        />


        <input
          type="text"
          placeholder="your prefilled username here"
          defaultValue={user?.username}
          readOnly
          className="mt-6 px-5 py-3 rounded-md text-gray-800 w-full max-w-xs bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-400"
        />

        <button
          onClick={() => setJoined(true)}
          disabled={!user || !user.username?.trim()}
          className="mt-4 px-6 py-3 bg-white text-pink-600 font-semibold rounded-lg shadow-md hover:bg-pink-100 disabled:opacity-40 transition-all"
        >
          🎥 Join Chat
        </button>

        <p className="mt-4 text-sm text-white/80">
          Your camera & mic will be used to connect with strangers.
        </p>
      </div>
    );
  }

  return (
    <Room
      user={user as User}
      setJoined={setJoined}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};
