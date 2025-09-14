import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import type { User } from "../../store/useAuthStore";

const URL = import.meta.env.VITE_SOCKET_SERVER_URL as string;

const Room = ({
  user,
  localAudioTrack,
  localVideoTrack,
  setJoined,
}: {
  user: User;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  setJoined: (joined: boolean) => void;
}) => {
  // const [searchParams, setSearchParams] = useSearchParams();
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
  const [, setPeerName] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPeerAudioMuted, setIsPeerAudioMuted] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);

  // 1. Add state for roomId and chat
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

  useEffect(() => {
    const socket = io(URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("register-name", { name: user.username });
    });

    socket.on("send-offer", async ({ roomId }) => {
      console.log("sending offer");
      setLobby(false);
      const pc = new RTCPeerConnection();

      setSendingPc(pc);
      if (localVideoTrack) {
        console.error("added local video tack");
        console.log(localVideoTrack);
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        console.error("added local audio tack");
        console.log(localAudioTrack);
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("on negotiation neeeded, sending offer");
        const sdp = await pc.createOffer();
        //@ts-ignore
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer");
      setLobby(false);
      const pc = new RTCPeerConnection();

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);
      // trickle ice
      setReceivingPc(pc);
      pc.ontrack = (e) => {
        console.error("inside ontrack");
        const { track, type } = e;
        if (type == "audio") {
          setRemoteAudioTrack(track);
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track);
        } else {
          setRemoteVideoTrack(track);
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track);
        }
        //@ts-ignore
        remoteVideoRef.current.play();
      };

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("omn ice candidate on receiving side");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      await pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      //@ts-ignore
      await pc.setLocalDescription(sdp);

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);

      console.log(roomId);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type });
      if (type == "sender") {
        setReceivingPc((pc) => {
          if (!pc) {
            console.error("receiving pc not found");
          } else {
            console.error(pc.ontrack);
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (!pc) {
            console.error("sending pc not found");
          } else {
            // console.error(pc.ontrack)
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    socket.on("matched", ({ peerName, roomId }) => {
      setPeerName(peerName);
      remoteVideoRef.current!.style.display = "block";
      remoteVideoRef.current!.muted = false;
      console.log("all values", { peerName, roomId });
      setRoomId(roomId);
      // if (remoteAudioTrack) {
      //   remoteAudioTrack.enabled = true;
      // }
    });

    socket.on("peer-video-toggled", ({ enabled }) => {
      remoteVideoRef.current!.style.display = enabled ? "block" : "none";
    });

    socket.on("peer-audio-toggled", ({ enabled }) => {
      setIsPeerAudioMuted(!enabled);
      if (remoteMuted) {
        return;
      }
      remoteVideoRef.current!.muted = !enabled;
    });

    socket.on("peer-disconnected", () => {
      console.log("peer disconnected");
      setIsPeerAudioMuted(false);
      setAudioEnabled(true);
      setRemoteMuted(false);
      // Clear remote video
      if (localAudioTrack) {
        localAudioTrack.enabled = true;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // Close and reset peer connections
      receivingPc?.close();
      sendingPc?.close();
      setReceivingPc(null);
      setSendingPc(null);

      // Reset UI
      setLobby(true);

      // setJoined(false);
    });

    socket.on("chat-message", appendMessageFromSender);

    setSocket(socket);
  }, [user.username]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  const skipAndReset = () => {
    setIsPeerAudioMuted(false);
    setAudioEnabled(true);
    setRemoteMuted(false);
    if (localAudioTrack) {
      localAudioTrack.enabled = true;
    }

    if (socket) {
      socket.emit("leave-room"); // Tell backend to clean up the room
    }

    // Clear local state
    remoteVideoRef.current && (remoteVideoRef.current.srcObject = null);
    receivingPc?.close();
    sendingPc?.close();

    setReceivingPc(null);
    setSendingPc(null);

    setLobby(true);
  };

  const toggleAudio = () => {
    if (localAudioTrack && socket) {
      const newState = !audioEnabled;
      localAudioTrack.enabled = newState;
      setAudioEnabled(newState);
      socket.emit("toggle-audio", { enabled: newState });
    }
  };

  const toggleRemoteAudio = () => {
    if (remoteVideoRef.current) {
      const isMuted = !remoteMuted;
      remoteVideoRef.current.muted = isMuted;
      setRemoteMuted(isMuted);
    }
  };

  // Send chat message to peer
  const sendChatMessage = () => {

    console.log("all values", { socket, roomId, chatInput });
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
              <button
                onClick={toggleRemoteAudio}
                className="absolute top-2 right-2 hover:cursor-pointer bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition"
                title={remoteMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {remoteMuted ? "🔇" : "🔊"}
              </button>
            </div>
            {/* <span className="mt-2 text-sm text-white/70">Stranger</span> */}
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
            {/* <span className="mt-2 text-sm text-white/70">Your Camera</span> */}
          </div>
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

        {/* Chat Messages */}
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
  hour: '2-digit', 
  minute: '2-digit' 
})}

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
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
          if (socket) socket.emit("exit");
          setJoined(false);
        }}
        className=" px-2 text-[10px] py-2 absolute left-2 top-2 bg-red-800 font-semibold rounded-lg hover:bg-red-600 transition"
      >
        ❌
      </button>
    </div>
  );
};

export default Room;
