import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import {
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  SkipForward,
  X,
  Send,
  Users,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:relay1.expressturn.com:3480",
    username: "000000002073404205",
    credential: "53dym495ky60Cp7PciYJEBmda9s=",
  },
];

const URL = import.meta.env.VITE_SOCKET_SERVER_URL as string;

interface PeerUser {
  name: string;
  college: string;
  gender: string;
}

const Room = ({
  user,
  localAudioTrack,
  localVideoTrack,
  topicName,
  setJoined,
}: {
  user: any;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  topicName?: string;
  setJoined: (joined: boolean) => void;
}) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [, setRemoteMediaStream] = useState<MediaStream | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [peerUser, setPeerUser] = useState<PeerUser | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPeerAudioMuted, setIsPeerAudioMuted] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);

  const [userCount, setUserCount] = useState<number>(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    {
      senderName: string;
      senderId: string;
      message: string;
      timestamp: number;
    }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCollege, setShowCollege] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const appendMessageFromSender = (msg: {
    senderName: string;
    senderId: string;
    message: string;
    timestamp: number;
  }) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  // --- Clean up peer connections and media ---
  const cleanupPeers = () => {
    receivingPc?.close();
    sendingPc?.close();
    setReceivingPc(null);
    setSendingPc(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  };

  useEffect(() => {
    const socket = io(URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      if (topicName) {
        socket.emit("register-name-topic", {
          user: {
            name: user.username,
            college: user?.college?.name,
            gender: user.gender,
            collegeState: user.collegeState,
            preferences: {
              states: user.matchingPreferences.selectedStates,
              preferredGender: [user.matchingPreferences.preferredGender],
            },
          },
          topic: topicName,
        });
      } else {
        socket.emit("register-name", {
          user: {
            name: user.username,
            college: user?.college?.name,
            gender: user.gender,
            collegeState: user.collegeState,
            preferences: {
              states: user.matchingPreferences.selectedStates,
              preferredGender: [user.matchingPreferences.preferredGender],
            },
          },
        });
      }
    });

    if (topicName) {
      socket.on(`user-count-${topicName}`, (data) => {
        setUserCount(data);
      });
    } else {
      socket.on("user-count", (data) => {
        setUserCount(data);
      });
    }

    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      setSendingPc(pc);
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      const videoStream = new MediaStream();
      setRemoteMediaStream(videoStream);

      setReceivingPc(pc);

      pc.ontrack = (e) => {
        const { track } = e;
        if (track.kind === "audio") {
          setRemoteAudioTrack(track);
          // Create a stream for just the audio track and assign to audio element
          const audioStream = new MediaStream([track]);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = audioStream;
            remoteAudioRef.current.muted = remoteMuted;
            // .play() will be triggered by browser if autoPlay is set
          }
        } else if (track.kind === "video") {
          setRemoteVideoTrack(track);
          videoStream.addTrack(track);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = videoStream;
            remoteVideoRef.current.play();
          }
        }
      };

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, sdp: answer });
    });

    socket.on("answer", ({ sdp: remoteSdp }) => {
      setLobby(false);

      setSendingPc((pc) => {
        pc?.setRemoteDescription(new RTCSessionDescription(remoteSdp));
        return pc;
      });
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type === "sender") {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(new RTCIceCandidate(candidate));
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          pc?.addIceCandidate(new RTCIceCandidate(candidate));
          return pc;
        });
      }
    });

    socket.on("matched", ({ peerUser, roomId }) => {
      setPeerUser(peerUser);
      remoteVideoRef.current &&
        (remoteVideoRef.current.style.display = "block");
      remoteVideoRef.current && (remoteVideoRef.current.muted = false);
      setRoomId(roomId);
    });

    socket.on("peer-video-toggled", ({ enabled }) => {
      remoteVideoRef.current &&
        (remoteVideoRef.current.style.display = enabled ? "block" : "none");
    });

    socket.on("peer-audio-toggled", ({ enabled }) => {
      setIsPeerAudioMuted(!enabled);
      setRemoteMuted((currentRemoteMuted) => {
        // React calls this function and passes the CURRENT value of remoteMuted
        if (currentRemoteMuted) {
          return currentRemoteMuted;
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.muted = !enabled;
        }
        return currentRemoteMuted;
      });
    });

    socket.on("peer-disconnected", () => {
      setIsPeerAudioMuted(false);
      setAudioEnabled(true);
      setRemoteMuted(false);
      setChatMessages([]);
      setPeerUser(null);
      if (localAudioTrack) {
        localAudioTrack.enabled = true;
      }
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      cleanupPeers();
      setLobby(true);
    });

    socket.on("chat-message", appendMessageFromSender);

    setSocket(socket);
    return () => {
      // Cleanup all listeners, peer connections and media
      socket.disconnect();
      cleanupPeers();
    };
  }, [user.username]);

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoRef.current.play();
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (isChatOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isChatOpen]);

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const handleKey = (e: KeyboardEvent) => {
      if (isMobile) return; // 🔒 disable keybindings on mobile

      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isTyping = activeTag === "input" || activeTag === "textarea";

      // 📝 If typing, ignore C (chat toggle) completely
      if (e.code === "KeyC" && !isTyping) {
        e.preventDefault();
        setIsChatOpen((o) => !o);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lobby]);

  const skipAndReset = () => {
    setIsPeerAudioMuted(false);
    setAudioEnabled(true);
    setRemoteMuted(false);
    setChatMessages([]);
    setPeerUser(null);
    if (localAudioTrack) {
      localAudioTrack.enabled = true;
    }
    if (socket && topicName) {
      socket.emit("leave-topic-room", { topic: topicName, roomId });
    } else if (socket) {
      socket.emit("leave-room", { roomId });
    }
    cleanupPeers();
    setLobby(true);
  };

  const toggleAudio = () => {
    if (localAudioTrack && socket) {
      const newState = !audioEnabled;
      localAudioTrack.enabled = newState;
      setAudioEnabled(newState);
      socket.emit("toggle-audio", { enabled: newState, roomId });
    }
  };

  const toggleRemoteAudio = () => {
    if (remoteAudioRef.current) {
      const isMuted = !remoteMuted;
      remoteAudioRef.current.muted = isMuted;
      setRemoteMuted(isMuted);
    }
  };

  // Send chat message to peer
  const sendChatMessage = () => {
    if (socket && roomId && chatInput.trim()) {
      socket.emit("chat-message", { roomId, message: chatInput });
      setChatMessages((prev) => [
        ...prev,
        {
          senderName: user.username!,
          senderId: socket.id ?? "unknown",
          message: chatInput,
          timestamp: Date.now(),
        },
      ]);
      setChatInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Main Video Area */}
      <div className="h-screen flex flex-col">
        {/* Header with online count only */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{userCount} online</span>
            <span className="sm:hidden">{userCount}</span>
          </div>

          <div className="text-center flex-1">
            <div className="flex justify-center items-center">
              <div className="capitalize text-xs text-gray-400">
                {topicName ? `${topicName}` : "Quick Chat"}
              </div>
            </div>
          </div>

          {/* Chat Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            title="Toggle Chat ( press C )"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center p-4 gap-4">
          {lobby ? (
            <div className="flex flex-col  gap-4 items-center justify-center max-w-6xl xl:max-w-7xl 2xl:max-w-[1350px] w-full">
              <div className="animate-pulse text-gray-400 mb-4">
                🔍 Matching you with someone...
              </div>

              {/* Local Video */}
              <div className="relative">
                <video
                  autoPlay
                  ref={localVideoRef}
                  className="rounded-lg shadow-xl w-80 h-60 lg:w-96 lg:h-72  object-cover bg-gray-800 border border-gray-700"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4  items-center justify-center max-w-6xl xl:max-w-7xl 2xl:max-w-[1350px] w-full">
              {/* Remote Video */}
              <div className="relative">
                <video
                  autoPlay
                  ref={remoteVideoRef}
                  className="rounded-lg shadow-xl w-80 h-60 lg:w-96 lg:h-72 xl:h-96 xl:w-[500px]  2xl:w-[700px] 2xl:h-[600px] object-cover bg-gray-800 border border-gray-700"
                />
                <audio
                  ref={remoteAudioRef}
                  autoPlay
                  controls
                  className="hidden"
                />
                {isPeerAudioMuted && (
                  <div className="absolute top-3 right-3 bg-gray-900 rounded-full p-2">
                    <MicOff className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <div
                    className="relative group flex gap-2 bg-black/60 px-2 py-1 rounded text-sm items-center"
                    onClick={() => setShowCollege((prev) => !prev)} // mobile toggle
                  >
                    <span>{peerUser?.name || "Peer"}</span>

                    {/* Institution icon */}
                    <GraduationCap className="w-4 h-4 text-gray-200 hover:cursor-pointer" />

                    {/* Tooltip */}
                    {(showCollege || <div className="hidden sm:block" />) && (
                      <div
                        className={`absolute bottom-full left-0 mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap 
            ${showCollege ? "block" : "hidden sm:group-hover:block"}`}
                      >
                        {peerUser?.college || "No college info"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Local Video */}
              <div className="relative">
                <video
                  autoPlay
                  ref={localVideoRef}
                  className="rounded-lg shadow-xl w-80 h-60 lg:w-96 lg:h-72 xl:h-96 xl:w-[500px] 2xl:w-[700px] 2xl:h-[600px] object-cover bg-gray-800 border border-gray-700"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 pb-4 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={toggleAudio}
              variant={audioEnabled ? "default" : "destructive"}
              size="lg"
              title={audioEnabled ? "Mute Your Mic" : "Unmute Your Mic"}
              className="rounded-full w-12 h-12 p-0"
            >
              {audioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            {/* Skip Button */}
            <div className="relative group">
              <Button
                onClick={skipAndReset}
                variant="secondary"
                size="lg"
                title="Skip"
                className="rounded-full w-12 h-12 p-0"
                disabled={lobby}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            <Button
              title="End Call"
              onClick={() => {
                if (localAudioTrack) {
                  localAudioTrack.enabled = true;
                }
                if (socket) {
                  if (topicName) {
                    socket.emit("exit-topic", { topic: topicName, roomId });
                  } else {
                    socket.emit("exit", { roomId });
                  }
                }

                setJoined(false);
                cleanupPeers();
              }}
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sliding Chat Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50",
          isChatOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold">Chat</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-black hover:cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.senderId === socket?.id ? "justify-end" : ""
                }`}
              >
                <div
                  className={`${
                    msg.senderId === socket?.id ? "bg-blue-600" : "bg-white/20"
                  } text-white px-3 min-w-[200px] relative py-2 rounded-lg max-w-[75%]`}
                >
                  {/* //if msg.senderName equals user.username, display "You" instead */}
                  {msg.senderName === user.username ? (
                    <div className="font-bold text-xs mb-1">You</div>
                  ) : (
                    <div className="font-bold text-xs mb-1">
                      {msg.senderName}
                    </div>
                  )}
                  <div className="w-3/4">{msg.message}</div>
                  <div className="text-[10px] absolute bottom-1 right-2 text-gray-300">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center focus:border-transparent"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <Button
                onClick={sendChatMessage}
                size="sm"
                className="px-3"
                disabled={!chatInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when chat is open on mobile */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Room;
