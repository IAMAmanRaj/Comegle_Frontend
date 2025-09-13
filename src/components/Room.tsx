import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_SERVER_URL as string;

const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
  setJoined,
}: {
  name: string;
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
  const [peerName, setPeerName] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPeerAudioMuted, setIsPeerAudioMuted] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);

  useEffect(() => {
    const socket = io(URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("register-name", { name });
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

    socket.on("matched", ({ peerName }) => {
      setPeerName(peerName);
      remoteVideoRef.current!.style.display = "block";
      remoteVideoRef.current!.muted = false;
      // if (remoteAudioTrack) {
      //   remoteAudioTrack.enabled = true;
      // }
    });

    socket.on("peer-video-toggled", ({ enabled }) => {
      remoteVideoRef.current!.style.display = enabled ? "block" : "none";
    });

    socket.on("peer-audio-toggled", ({ enabled }) => {
      setIsPeerAudioMuted(!enabled);
      remoteVideoRef.current!.muted = !enabled;
    });

    socket.on("peer-disconnected", () => {
      // Clear remote video
      setIsPeerAudioMuted(false);
      setAudioEnabled(true);
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

    setSocket(socket);
  }, [name]);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-500 flex flex-col items-center justify-center px-4 py-8 text-white space-y-6">
      <h1 className="text-4xl font-bold">🎥 Comegle Room</h1>
      <p className="text-white/80 text-lg">
        Hi <span className="font-semibold">{name}</span>
      </p>

      {peerName && (
        <div className="bg-white/10 px-4 py-2 rounded-lg shadow-md backdrop-blur-sm text-white font-medium">
          🧑‍💻 You are talking to:{" "}
          <span className="font-semibold">{peerName}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex flex-col items-center">
          <video
            autoPlay
            ref={localVideoRef}
            className="rounded-xl border-4 border-white/20 shadow-lg w-80 h-56 object-cover bg-black"
          />
          <span className="mt-2 text-sm text-white/70">Your Camera</span>
        </div>

        <div className="flex flex-col items-center relative">
          <div className="relative">
            <video
              autoPlay
              ref={remoteVideoRef}
              className="rounded-xl border-4 border-white/20 shadow-lg w-80 h-56 object-cover bg-black"
            />
            <button
              onClick={toggleRemoteAudio}
              className="absolute top-2 right-2 hover:cursor-pointer bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition"
              title={remoteMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {remoteMuted ? "🔇" : "🔊"}
            </button>
          </div>
          <span className="mt-2 text-sm text-white/70">Stranger</span>
          {isPeerAudioMuted && (
            <span className="text-xs text-red-400 mt-1 animate-pulse">
              🔇 Peer has muted their mic
            </span>
          )}
        </div>
      </div>

      {lobby ? (
        <div className="mt-4 text-white/80 animate-pulse">
          🔍 Matching you with someone...
        </div>
      ) : (
        <div className="flex gap-4 mt-6">
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

      <button
        onClick={() => {
          if (localAudioTrack) {
            localAudioTrack.enabled = true;
          }
          if (socket) socket.emit("exit");
          setJoined(false);
        }}
        className="mt-6 px-6 py-2 bg-red-500 font-semibold rounded-lg hover:bg-red-600 transition"
      >
        ❌ Exit
      </button>
    </div>
  );
};

export default Room;
