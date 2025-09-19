import { useEffect, useRef, useState } from "react";
import Communities from "../communities/Communities";
import { useAuthStore, type User } from "../../store/useAuthStore";
import Header from "../General/Header";
import {
  Play,
  Settings,
  Users,
  TrendingUp,
  ArrowRight,
  Camera,
  User as UserIcon,
} from "lucide-react";
import LogoutModal from "./LogoutModal";
import { api } from "@/lib/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfigureMatching from "./ConfigureMatching";
import Room from "./Room";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_SERVER_URL as string;

interface MatchingPreferences {
  selectedStates: string[] | "*";
  country: string;
  collegeState: string;
  preferredGender: "male" | "female" | "any";
}

export const Main = () => {
  const navigate = useNavigate();
  const { user, setUser, setToken, selectedCommunity, setSelectedCommunity } =
    useAuthStore();
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sidebarVideoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);
  // Removed unused selectedCommunityId state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);

  const [isTestingMic, setIsTestingMic] = useState(false);
const [micLevel, setMicLevel] = useState(0);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const micStreamRef = useRef<MediaStream | null>(null);
  const micAnimationFrameRef = useRef<number | null>(null);
  

  const startMicTest = async () => {
  setIsTestingMic(true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;
    audioContextRef.current = new (
  window.AudioContext || (window as any).webkitAudioContext
)();
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateMicLevel = () => {
      analyser.getByteTimeDomainData(dataArray);
      // Calculate RMS (volume level)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setMicLevel(rms);
      micAnimationFrameRef.current = requestAnimationFrame(updateMicLevel);
    };

    updateMicLevel();
  } catch (err) {
    toast.error("Microphone access denied");
    setIsTestingMic(false);
  }
};

const stopMicTest = () => {
  setIsTestingMic(false);
  if (micAnimationFrameRef.current) {
    cancelAnimationFrame(micAnimationFrameRef.current);
  }
  if (micStreamRef.current) {
    micStreamRef.current.getTracks().forEach(track => track.stop());
    micStreamRef.current = null;
  }
  if (audioContextRef.current) {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }
  setMicLevel(0);
  };
  
  

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [matchingPreferences, setMatchingPreferences] =
    useState<MatchingPreferences>({
      selectedStates: "*",
      country: user?.college?.country || "",
      collegeState: user?.college?.state || "",
      preferredGender: "any",
    });

  const trendingCommunities = ["DSA", "Movies", "Competitive Programming"];
  //define it's type it's like { general, topics }
  const [userCountData, setUserCountData] = useState<{
    general: number;
    topics: Record<string, number>;
  }>({
    general: 0,
    topics: {},
  });
  const [totalCommunityCount, setTotalCommunityCount] = useState(0);

  // Trending communities animation
  useEffect(() => {
    if (trendingCommunities.length > 1) {
      const interval = setInterval(() => {
        setCurrentTrendingIndex(
          (prev) => (prev + 1) % trendingCommunities.length
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

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
    setSelectedCommunity(null);
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

  const handleSidebarToggle = () => {
  setIsSidebarOpen(!isSidebarOpen);
  if (!isSidebarOpen && sidebarVideoRef.current && localVideoTrack) {
    sidebarVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
    sidebarVideoRef.current.play();
  }
  if (isSidebarOpen) {
    stopMicTest();
  }
};

  const handleJoinCommunity = (communityName: string) => {
    if (setSelectedCommunity) {
      setSelectedCommunity(communityName);
    }

    // socket.emit as above

    setJoined(true);
  };

  // const handleLeaveRoom = () => {
  //   setJoined(false);
  // };

  const handleBackToCommunities = () => {
    setShowCommunities(false);
  };

  useEffect(() => {
    getCam();
  }, []);

  useEffect(() => {
    const socket: Socket = io(URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to socket for general lobby count");
    });

    socket.on("total-user-count-update", (data) => {
      console.log("user Count data:", data);
      setUserCountData(data);
      let total = 0;
      for (const topic in data.topics) {
        total += data.topics[topic];
      }
      setTotalCommunityCount(total);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Mock user data if not available
  // const mockUser = user || {
  //   username: 'john_doe',
  //   college: {
  //     name: 'MIT',
  //     state: 'Massachusetts',
  //     country: 'USA'
  //   }
  // };

  if (joined) {
    return (
      <Room
        user={{
          ...user,
          collegeState: user?.college?.state || "",
          matchingPreferences: matchingPreferences,
        }}
        topicName={selectedCommunity ?? undefined}
        setJoined={setJoined}
        localAudioTrack={localAudioTrack}
        localVideoTrack={localVideoTrack}
      />
    );
  }

  // if (joined && selectedCommunityId) {
  //   return (
  //     <Room2
  //       communityId={selectedCommunityId}
  //       onLeaveRoom={handleLeaveRoom}
  //       localAudioTrack={localAudioTrack}
  //       localVideoTrack={localVideoTrack}
  //       user={mockUser}
  //     />
  //   );
  // }

  if (showCommunities) {
    return (
      <Communities
        onJoinCommunity={handleJoinCommunity}
        onBack={handleBackToCommunities}
        totalCommunityCount={totalCommunityCount}
        communitySpecificUserCount={userCountData.topics}
      />
    );
  }

  return (
    <div className="overflow-scroll lg:overflow-hidden h-full md:h-[100vh] z-20 ">
      {/* Background image */}
      <div
        className="absolute hidden md:block inset-0 w-full h-full -z-10"
        style={{
          backgroundImage: "url('/images/landing/bg.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
      {/* Opacity overlay - adjust bg-black/xx as needed */}
      <div className="absolute hidden md:block inset-0 w-full h-full -z-10 bg-black/30" />{" "}
      {/* <-- change 30 to 40, 50, etc. */}
      <Header
        user={user as User}
        onProfileClick={() => navigate("/profile")}
        onLogoutClick={() => setShowLogoutModal(true)}
      />
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col  relative z-30">
        {/* Check Hair Button */}
        <button
          onClick={handleSidebarToggle}
          className="hidden lg:block absolute bottom-6 right-6  z-40 hover:cursor-pointer bg-white backdrop-blur-sm hover:bg-white/80 shadow-lg rounded-full p-4 transition-all duration-300 transform hover:scale-110 border border-gray-200"
          title="Check your appearance"
        >
          <div className="flex items-center space-x-2">
            <Camera className="w-7 h-7 text-gray-700" />
            <UserIcon className="w-7 h-7 text-gray-700" />
          </div>
        </button>

        {/* Central Content */}
        <div className="flex flex-col md:flex-row h-auto py-3 gap-4 overflow-hidden items-center md:justify-center px-4 md:px-8">
          {/* Quick Connect Card */}
          <div className="bg-white/90 backdrop-blur-sm mt-2 w-full md:w-[350px] lg:w-[480px] p-3 md:pb-2 md:pt-6 lg:pt-5 md:h-auto rounded-2xl  border border-gray-200">
            <h2 className="md:text-lg lg:text-2xl font-semibold text-gray-900 mb-6 text-center">
              Quick Connect
            </h2>

            <div className="flex items-center justify-between mb-6 md:mb-2 lg:mb-6 p-4 bg-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center  hover:cursor-pointer">
                <Users className="w-5 h-5 text-green-600 mr-2 " />
                {/* if user count is more than 1 then show students else show join in and let other's know you're here */}
                {userCountData?.general >= 1 ? (
                  <span className="text-emerald-700 font-semibold">
                    {userCountData?.general}{" "}
                    {userCountData?.general > 1 ? "students" : "student"} online
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold text-[14px] sm:text-[16px] md:text-[13px] lg:text-[16px]">
                    Join in and let others know you're here
                  </span>
                )}
              </div>
              <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse hidden md:block"></div>
            </div>

            {/* You'll be joining as */}
            <div className="mb-4">
              <p className="text-gray-600 mb-3 ml-1 font-medium">
                You'll be joining as:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-900">@{user?.username}</p>
                <p className="text-sm text-gray-600">
                  {user?.college?.name}, {user?.college?.state}
                </p>
              </div>
            </div>

            {/* Configure Matching */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="w-full  hover:cursor-pointer  bg-emerald-700 text-white py-3 px-6 rounded-xl hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3 font-medium "
            >
              <Settings className="w-5 h-5 " />
              <span>Configure Matching</span>
            </button>

            <button
              onClick={() => {
                console.log(matchingPreferences);
                setSelectedCommunity(null);
                setJoined(true);
              }}
              disabled={!user || !user.username?.trim()}
              className="w-full mt-2  hover:cursor-pointer bg-gradient-to-r from-gray-500 via-gray-700 shadow-3xl to-gray-800 hover:opacity-90 text-white py-3 md:py-3 lg:py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 md:text-sm lg:text-lg font-medium  disabled:opacity-40  mb-6 md:mb-3"
            >
              <Play className="w-6 h-6" />
              <span>Start Quick Chat</span>
            </button>
          </div>

          <button
            onClick={handleSidebarToggle}
            className="block md:hidden  z-40 hover:cursor-pointer bg-white backdrop-blur-sm hover:bg-white/80 shadow-lg rounded-full p-4 transition-all duration-300 transform hover:scale-110 border border-gray-200"
            title="Check your appearance"
          >
            <div className="flex items-center space-x-2">
              <Camera className="w-7 h-7 text-gray-700" />
              <UserIcon className="w-7 h-7 text-gray-700" />
            </div>
          </button>
          {/* Community Connect Card - Main Highlight */}
          <div className="bg-gradient-to-br  md:w-[350px] lg:w-[480px] p-5 md:h-auto from-emerald-600 to-emerald-700 rounded-2xl mt-2  text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-4 md:mb-2">
                <TrendingUp className="w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </span>
              </div>

              <h3 className="text-2xl md:text-lg lg:text-2xl font-bold mb-3">
                Join Interest Communities
              </h3>

              <p className="text-white/90 mb-4 text-md md:text-sm lg:text-lg leading-relaxed">
                Connect with students who share your passions. From coding to
                movies, find your tribe in our exclusive community rooms.
              </p>

              {/* Live User Count */}
              <div className="flex items-center justify-between mb-4 p-3 bg-white/20 rounded-xl border border-white/30">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-white mr-2" />
                  <span className="text-white font-semibold">
                    {totalCommunityCount} in communities
                  </span>
                </div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>

              {/* Trending Communities */}
              <div className="mb-6">
                <p className="text-white/80 text-sm mb-2">Trending now:</p>
                <div className="h-8 flex items-center">
                  {trendingCommunities.length > 1 ? (
                    <div className="relative w-full">
                      {trendingCommunities.map((community, index) => (
                        <div
                          key={community}
                          className={`absolute inset-0 flex items-center transition-all duration-500 ${
                            index === currentTrendingIndex
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2"
                          }`}
                        >
                          <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold text-white">
                            {community}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold text-white">
                      {trendingCommunities[0]}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowCommunities(true)}
                className="bg-white hover:cursor-pointer text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 w-full justify-center"
              >
                <span>Explore Communities</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

         {/* Check Hair Button */}
        <button
          onClick={handleSidebarToggle}
          className="hidden md:block lg:hidden w-fit mx-auto  z-40 hover:cursor-pointer bg-white backdrop-blur-sm hover:bg-white/80 shadow-lg rounded-full p-4 transition-all duration-300 transform hover:scale-110 border border-gray-200"
          title="Check your appearance"
        >
          <div className="flex items-center space-x-2">
            <Camera className="w-7 h-7 text-gray-700" />
            <UserIcon className="w-7 h-7 text-gray-700" />
          </div>
        </button>

        {/* How it Works - Bottom Center */}
        <div className="mb-4 mt-4 flex justify-center h-[170px]">
          <div className="bg-white/80 backdrop-blur-sm p-6 pt-2 rounded-2xl  max-w-3xl mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              How it works ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              <div className="text-center">
                <div className="w-10 h-10 hover:cursor-pointer bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  Choose <strong>Quick Connect</strong> or browse{" "}
                  <strong>Communities</strong>
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 hover:cursor-pointer bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  Get matched with students based on your preferences
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 hover:cursor-pointer bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  Start video chatting and making meaningful connections
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full z-50 bg-white border-1 rounded-l-3xl shadow-2xl w-96 overflow-hidden transition-transform duration-500 ease-in-out
  ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="h-full flex flex-col px-2">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Check Your Appearance
              </h2>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1">
              <div className="relative mx-auto  mt-2 ">
                <video
                  autoPlay
                  ref={sidebarVideoRef}
                  className="rounded-2xl w-full border border-gray-200 shadow-lg"
                />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Live
                  </div>
                </div>
              </div>

              <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-blue-200">
                <h3 className="font-medium text-gray-700 mb-2">Camera Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Make sure you're well-lit</li>
                  <li>• Position camera at eye level</li>
                  <li>• Check your background</li>
                  <li>• Test your microphone</li>
                </ul>
              </div>
{/* Mic Test UI */}
      {/* Mic Test UI */}
<div className="mt-2 p-5 bg-white rounded-2xl ">
  <h3 className="font-semibold text-gray-700 mb-3 text-lg">
    🎙️ Test Your Microphone
  </h3>

  <div className="flex flex-col sm:flex-row items-center gap-4">
    {/* Button */}
    <button
      onClick={isTestingMic ? stopMicTest : startMicTest}
      className={`px-5 hover:cursor-pointer py-1 rounded-lg font-medium text-[14px] transition-all duration-200 shadow-sm
        ${isTestingMic ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-emerald-600 hover:bg-emerald-700  text-white"}
      `}
    >
      {isTestingMic ? "Stop Test" : "Test Mic"}
    </button>

    {/* Mic Level Bar */}
    <div className="flex items-center h-7 w-36 bg-gray-100 rounded-full relative overflow-hidden border border-gray-300">
      <div
        className="absolute left-0 top-0 h-full bg-emerald-600 transition-all duration-100"
        style={{ width: `${Math.min(100, Math.floor(micLevel * 800))}%` }}
      />
      <span className="absolute left-2 text-xs text-gray-700 font-semibold">
        {micLevel > 0.001 ? "Input Detected" : "No Input"}
      </span>
    </div>
  </div>

  <p className="text-xs text-gray-600 mt-3 text-center sm:text-left">
    Speak into your microphone. The green bar will react to your voice.
  </p>
</div>


            </div>

            <button
              onClick={handleSidebarToggle}
              className="p-2 right-4 absolute bottom-3 hover:bg-emerald-600 rounded-full bg-emerald-700 hover:cursor-pointer  w-[130px] py-3 transition-colors"
            >
              <span className="font-semibold text-white p-2 text-lg ">
                Close
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              key="sidebar-overlay"
              className="fixed inset-0 bg-black/80 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={handleSidebarToggle}
            />
          )}
        </AnimatePresence>
      </main>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      <AnimatePresence>
        {showConfigModal && (
          <ConfigureMatching
            onClose={() => setShowConfigModal(false)}
            currentPreferences={matchingPreferences}
            onSave={handleSavePreferences}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
