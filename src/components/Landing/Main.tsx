import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import { useAuthStore, type User } from "../../store/useAuthStore";
import Header from "../General/Header";
import { Play, Settings, Users } from "lucide-react";
import LogoutModal from "./LogoutModal";
import { api } from "../../Utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfigureMatching from "./ConfigureMatching";
interface MatchingPreferences {
  selectedStates: string[] | "*";
  country: string;
  collegeState: string;
  preferredGender: "male" | "female" | "any";
}

export const Main = () => {
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuthStore();
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [matchingPreferences, setMatchingPreferences] =
    useState<MatchingPreferences>({
      selectedStates: "*", // default all or own state
      country: user?.college?.country || "",
      collegeState: user?.college?.state || "",
      preferredGender: "any",
    });

  const handleSavePreferences = (preferences: MatchingPreferences) => {
    setMatchingPreferences(preferences);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out!");
    } catch (err) {
      toast.error("Failed to log out");
    }
    setUser(null);
    setToken(null);
    setShowLogoutModal(false);
    navigate("/");
  };

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

  if (joined) {
    return (
      <Room
        user={{
          ...user,
          collegeState: user?.college?.state || "",
          matchingPreferences: matchingPreferences,
        }}
        setJoined={setJoined}
        localAudioTrack={localAudioTrack}
        localVideoTrack={localVideoTrack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user as User}
        onProfileClick={() => navigate("/profile")}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Video Preview */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Connect with Fellow Students
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Meet and chat with college students from around the country.
                Share experiences, make friends, and expand your network.
              </p>
            </div>

            <video
              autoPlay
              ref={videoRef}
              className="rounded-2xl w-full max-w-md aspect-video border-4 border-gray-200 shadow-xl"
            />
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Chat?
              </h2>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">You'll be joining as:</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">
                    @{user?.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user?.college?.name}, {user?.college?.state}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  console.log(matchingPreferences)
                  setJoined(true);
                }}
                disabled={!user || !user.username?.trim()}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-3 text-lg font-medium shadow-lg disabled:opacity-40"
              >
                <Play className="w-6 h-6" />
                <span>Start Chatting</span>
              </button>

              <button
                onClick={() => setShowConfigModal(true)}
                className="w-full mt-4 bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center space-x-3 font-medium"
              >
                <Settings className="w-5 h-5" />
                <span>Configure Matching</span>
              </button>
            </div>

            {/* How it Works Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                How it works
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                  <span>
                    Click <strong>Join Video Chat</strong> to start matching
                    with other students
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                  <span>We’ll match you based on your preferences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                  <span>Start chatting and making new connections</span>
                </li>
              </ul>
            </div>

            {/* Matching Preferences Preview */}
            {matchingPreferences.selectedStates.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">
                  Your Matching Preferences
                </h3>
                <p className="text-sm text-blue-700">
                  Connecting with students from:{" "}
                  {Array.isArray(matchingPreferences.selectedStates)
                    ? matchingPreferences.selectedStates.slice(0, 3).join(", ")
                    : matchingPreferences.selectedStates === "*" 
                      ? "All Regions"
                      : matchingPreferences.selectedStates}
                  {Array.isArray(matchingPreferences.selectedStates) &&
                    matchingPreferences.selectedStates.length > 3 &&
                    ` and ${
                      matchingPreferences.selectedStates.length - 3
                    } more states`}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* TODO: Drop in your ConfigureMatching modal component here */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Configure Preferences
            </h2>
            <button
              onClick={() => setShowConfigModal(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      <ConfigureMatching
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        currentPreferences={matchingPreferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
};
