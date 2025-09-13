import { useEffect, useRef, useState } from "react";
import Room from "./Room";

export const Landing = () => {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);

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

  if (!joined) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 flex flex-col justify-center items-center px-4 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-white/10 px-6 py-3 rounded-xl shadow-md backdrop-blur-md">
          ✨ Comegle
        </h1>

        <video
          autoPlay
          ref={videoRef}
          className="rounded-2xl w-full max-w-md aspect-video border-4 border-white/30 shadow-xl"
        />

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-6 px-5 py-3 rounded-md text-gray-800 w-full max-w-xs bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-400"
        />

        <button
          onClick={() => setJoined(true)}
          disabled={!name.trim()}
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
      name={name}
      setJoined={setJoined}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};
