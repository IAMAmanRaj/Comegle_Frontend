import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  // For production, add a TURN server here for guaranteed relay:
  // { urls: "turn:your.turn.server:3478", username: "username", credential: "password" }
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
        setUserCount(data.count);
      });
    } else {
      socket.on("user-count", (data) => {
        setUserCount(data.count);
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
    <div className="min-h-screen lg:overflow-hidden relative w-full lg:pl-8 bg-gradient-to-br from-blue-500 via-amber-950 to-indigo-500 flex flex-col gap-8 lg:gap-0 lg:flex-row  text-white ">
      <div className="leftDiv lg:h-screen w-full lg:w-1/2 pt-12 lg:pl-24 flex flex-col">
        <div className="flex w-full lg:h-[70%] mb-12 flex-col  lg:items-start ">
          <div className="flex flex-col items-center relative">
            <div className="relative">
              <video
                autoPlay
                ref={remoteVideoRef}
                className="rounded-xl border-4 border-white/20 shadow-lg h-56 w-80 object-cover bg-black"
              />
              <audio
                ref={remoteAudioRef}
                autoPlay
                controls
                className="absolute left-0 bottom-0"
                style={{ display: "none" }}
              />
              <button
                onClick={toggleRemoteAudio}
                className="absolute top-2 right-2 hover:cursor-pointer bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition"
                title={remoteMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {remoteMuted ? "🔇" : "🔊"}
              </button>
            </div>
            {isPeerAudioMuted && (
              <span className="text-xs text-red-400 mt-1 animate-pulse">
                🔇 Peer has muted their mic
              </span>
            )}
          </div>
          <div className="flex flex-col  items-center">
            <video
              autoPlay
              ref={localVideoRef}
              className="rounded-xl border-4 border-white/20 shadow-lg h-56 w-80 object-cover bg-black"
            />
          </div>
        </div>
        <div className="mt-4 w-[200px] mx-auto text-sm font-semibold bg-white/20 px-4 py-2 rounded-lg shadow-md backdrop-blur-sm">
          🟢 {userCount} {userCount === 1 ? "user online" : "users online"}
        </div>
        {lobby ? (
          <div className="lg:mt-4 w-full lg:w-80 text-center text-white/80 animate-pulse">
            🔍 Matching you with someone...
          </div>
        ) : (
          <div className="flex gap-4 lg:mt-6 w-full lg:w-80 justify-center">
            <button
              onClick={skipAndReset}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
            >
              ⏭ Skip
            </button>
            <button
              onClick={toggleAudio}
              className="px-6 py-2 bg-green-600 font-semibold rounded-lg hover:bg-green-700 transition"
            >
              {audioEnabled ? "🎤 Mute" : "🎤 Unmute"}
            </button>
          </div>
        )}
      </div>
      <div className="rightDiv h-[70vh] lg:h-screen w-full lg:w-1/2 flex flex-col bg-black/50 p-4">
        <h2 className="text-xl font-semibold text-white mb-2">💬 Chat</h2>
        {peerUser && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/20 rounded-lg p-3 mb-3">
            <div className="text-sm text-white/90">
              🎉{" "}
              <span className="font-semibold">
                {peerUser.name} ({peerUser.gender})
              </span>{" "}
              from{" "}
              <span className="font-medium text-blue-200">
                {peerUser.college}
              </span>{" "}
              {topicName ? (
                <span>interested in <i><b>{topicName ?? "Undefined"}</b></i> </span>
              ) : (
                <></>
              )}
              has joined the chat!
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-white/10 rounded-lg p-3 space-y-2 text-sm">
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
                <div className="font-bold text-xs mb-1">{msg.senderName}</div>
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
        <div className="mt-3 flex">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-l-lg bg-white/80 text-black focus:outline-none"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
          />
          <button
            className="bg-green-500 px-4 py-2 rounded-r-lg hover:bg-green-600 transition"
            onClick={sendChatMessage}
          >
            Send
          </button>
        </div>
      </div>
      <button
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
        className=" px-2 text-[10px] py-2 absolute left-2 top-2 bg-red-800 font-semibold rounded-lg hover:bg-red-600 transition"
      >
        ❌
      </button>
    </div>
  );
};

export default Room;
