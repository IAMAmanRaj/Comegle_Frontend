import React, { useState, useRef, useEffect } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  SkipForward, 
  Send,
  ArrowLeft,
  User
} from 'lucide-react';

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

interface Peer {
  name: string;
  gender: string;
  college: string;
  avatar?: string;
}

interface RoomProps {
  communityId: string;
  onLeaveRoom: () => void;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  user: any;
}

const Room2: React.FC<RoomProps> = ({ 
  communityId, 
  onLeaveRoom, 
  localAudioTrack, 
  localVideoTrack,
  user 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPeerMuted, setIsPeerMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock peer data
  const [peer] = useState<Peer>({
    name: 'Alex Johnson',
    gender: 'Male',
    college: 'Stanford University',
  });

  // Mock initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        username: peer.name,
        message: 'Hey! Nice to meet you!',
        timestamp: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
      },
      {
        id: '2',
        username: user?.username || 'You',
        message: 'Hi there! Great to connect with someone interested in the same topics.',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      },
    ];
    setMessages(initialMessages);
  }, [peer.name, user?.username]);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoRef.current.play();
    }

    // Mock remote video stream
    if (remoteVideoRef.current) {
      // In a real app, this would be the peer's video stream
      remoteVideoRef.current.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
    }
  }, [localVideoTrack]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      username: user?.username || 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Mock peer response after a delay
    setTimeout(() => {
      const peerResponse: Message = {
        id: (Date.now() + 1).toString(),
        username: peer.name,
        message: 'That\'s interesting! Tell me more about that.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
      };
      setMessages(prev => [...prev, peerResponse]);
    }, 2000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localAudioTrack) {
      localAudioTrack.enabled = isMuted;
    }
  };

  const togglePeerMute = () => {
    setIsPeerMuted(!isPeerMuted);
  };

  const skipUser = () => {
    // In a real app, this would disconnect and find a new peer
    onLeaveRoom();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onLeaveRoom}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Communities
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Connected with {peer.name}
            </h2>
            <p className="text-sm text-gray-600">
              {peer.gender} • {peer.college}
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Section */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Main) */}
          <div className="w-full h-full relative">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {isPeerMuted && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                Peer Muted
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {isMuted && (
              <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full">
                <MicOff className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={togglePeerMute}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isPeerMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Mute Peer"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={skipUser}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                title="Skip User"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={onLeaveRoom}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                title="Leave Room"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Chat</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.username} • {message.timestamp}
                  </div>
                  <div className="text-sm">{message.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room2;