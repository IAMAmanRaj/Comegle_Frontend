import { useEffect, useRef, useState } from "react";
import Communities from "../communities/Communities";
import { useAuthStore, type User } from "../../store/useAuthStore";
import Header from "../General/Header";
import { Play, Settings, Users, TrendingUp, ArrowRight, Camera, User as UserIcon, X } from "lucide-react";
import LogoutModal from "./LogoutModal";
import { api } from "../../Utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfigureMatching from "./ConfigureMatching";
import Room2 from "./Room2";
import Room from "./Room";
import { motion, AnimatePresence } from "framer-motion";

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
  const sidebarVideoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [matchingPreferences, setMatchingPreferences] =
    useState<MatchingPreferences>({
      selectedStates: "*",
      country: user?.college?.country || "",
      collegeState: user?.college?.state || "",
      preferredGender: "any",
    });

  const trendingCommunities = ["DSA", "Movies", "Competitive Programming"];

  // Trending communities animation
  useEffect(() => {
    if (trendingCommunities.length > 1) {
      const interval = setInterval(() => {
        setCurrentTrendingIndex((prev) => (prev + 1) % trendingCommunities.length);
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
  };

  const handleJoinCommunity = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setJoined(true);
  };

  const handleLeaveRoom = () => {
    setJoined(false);
    setSelectedCommunityId(null);
  };

  const handleBackToCommunities = () => {
    setShowCommunities(false);
  };

  useEffect(() => {
    getCam();
  }, []);

  // Mock user data if not available
  const mockUser = user || {
    username: 'john_doe',
    college: {
      name: 'MIT',
      state: 'Massachusetts',
      country: 'USA'
    }
  };

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
      />
    );
  }

  return (
    <div className="h-full overflow-scroll lg:overflow-hidden lg:h-screen z-20 flex flex-col">
        {/* Background image */}
  <div
    className="absolute inset-0 w-full h-full -z-10"
    style={{
      backgroundImage: "url('/images/landing/bg.png')",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }}
  />
  {/* Opacity overlay - adjust bg-black/xx as needed */}
  <div className="absolute inset-0 w-full h-full z-10 bg-black/30" /> {/* <-- change 30 to 40, 50, etc. */}

      <Header
        user={mockUser as User}
        onProfileClick={() => navigate("/profile")}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-30">
        {/* Check Hair Button */}
        <button
          onClick={handleSidebarToggle}
          className="absolute bottom-6 right-6 z-40 hover:cursor-pointer bg-white backdrop-blur-sm hover:bg-white/80 shadow-lg rounded-full p-4 transition-all duration-300 transform hover:scale-110 border border-gray-200"
          title="Check your appearance"
        >
          <div className="flex items-center space-x-2">
            <Camera className="w-7 h-7 text-gray-700" />
            <UserIcon className="w-7 h-7 text-gray-700" />
          </div>
        </button>

        {/* Central Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Quick Connect Card */}
            <div className="bg-white/90 backdrop-blur-sm  p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Quick Connect
              </h2>

              <div className="flex items-center justify-between mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center  hover:cursor-pointer">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold">2,847 students online</span>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <button
                onClick={() => {
                  console.log(matchingPreferences);
                  setJoined(true);
                }}
                disabled={!mockUser || !mockUser.username?.trim()}
                className="w-full  hover:cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-medium shadow-lg disabled:opacity-40 transform hover:scale-105 mb-6"
              >
                <Play className="w-6 h-6" />
                <span>Start Quick Chat</span>
              </button>

              {/* You'll be joining as */}
              <div className="mb-4">
                <p className="text-gray-600 mb-3 font-medium">You'll be joining as:</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-900">
                    @{mockUser?.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {mockUser?.college?.name}, {mockUser?.college?.state}
                  </p>
                </div>
              </div>

              {/* Configure Matching */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="w-full  hover:cursor-pointer bg-teal-700 text-white py-3 px-6 rounded-xl hover:bg-teal-600 transition-all duration-300 flex items-center justify-center space-x-3 font-medium transform hover:scale-105"
              >
                <Settings className="w-5 h-5 " />
                <span>Configure Matching</span>
              </button>
            </div>

            {/* Community Connect Card - Main Highlight */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden transform scale-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">
                  Join Interest Communities
                </h3>
                
                <p className="text-white/90 mb-4 leading-relaxed">
                  Connect with students who share your passions. From coding to movies, 
                  find your tribe in our exclusive community rooms.
                </p>

                {/* Live User Count */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white/20 rounded-xl border border-white/30">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-white mr-2" />
                    <span className="text-white font-semibold">1,543 in communities</span>
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
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-2'
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
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 w-full justify-center"
                >
                  <span>Explore Communities</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works - Bottom Center */}
        <div className="pb-3 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 pt-2 pb-2 rounded-2xl border border-gray-200 shadow-lg max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">1</div>
                <p className="text-sm text-gray-700">Choose <strong>Quick Connect</strong> or browse <strong>Communities</strong></p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">2</div>
                <p className="text-sm text-gray-700">Get matched with students based on your preferences</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-2">3</div>
                <p className="text-sm text-gray-700">Start video chatting and making meaningful connections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-0 right-0 h-full z-50 bg-white border-1 rounded-l-3xl shadow-2xl w-96 overflow-hidden transition-transform duration-500 ease-in-out
  ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col px-2">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-center">
              <h2 className="text-xl font-semibold text-gray-900">Check Your Appearance</h2>
              
            </div>

            {/* Sidebar Content */}
            <div className="flex-1">
                
              <div className="relative mx-auto  mt-12 ">
                <video
                  autoPlay
                  ref={sidebarVideoRef}
                  className="rounded-2xl w-full border border-gray-200 shadow-lg"
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Live
                  </div>
                </div>
              </div>

               <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">
                  Camera Tips
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Make sure you're well-lit</li>
                  <li>• Position camera at eye level</li>
                  <li>• Check your background</li>
                  <li>• Test your microphone</li>
                </ul>
              </div>

           
            </div>

            <button
                onClick={handleSidebarToggle}
                className="p-2 right-4 absolute bottom-7 hover:bg-blue-600 rounded-full bg-blue-700 hover:cursor-pointer  w-[130px] py-3 transition-colors"
              >
                <span className="font-semibold text-white p-2 text-lg ">Close</span>
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