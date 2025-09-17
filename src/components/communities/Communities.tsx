import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type User } from '../../store/useAuthStore';
import Header from '../General/Header';
import AddInterestModal from './AddInterestModal';

interface Community {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
  isTrending: boolean;
  category: string;
}

const MOCK_COMMUNITIES: Community[] = [
  { id: '1', name: 'Data Structures & Algorithms', description: 'Discuss coding problems and algorithms', activeUsers: 234, isTrending: true, category: 'Technical' },
  { id: '2', name: 'System Design', description: 'Learn and share system design concepts', activeUsers: 189, isTrending: true, category: 'Technical' },
  { id: '3', name: 'Mock Interviews', description: 'Practice interviews with peers', activeUsers: 156, isTrending: false, category: 'Career' },
  { id: '4', name: 'Competitive Programming', description: 'Solve contests together', activeUsers: 143, isTrending: false, category: 'Technical' },
  { id: '5', name: 'Movies & TV Shows', description: 'Discuss latest movies and series', activeUsers: 298, isTrending: true, category: 'Entertainment' },
  { id: '6', name: 'Photography', description: 'Share and critique photos', activeUsers: 87, isTrending: false, category: 'Creative' },
  { id: '7', name: 'Placements & Jobs', description: 'Job search and placement tips', activeUsers: 201, isTrending: true, category: 'Career' },
  { id: '8', name: 'Sports', description: 'Talk about your favorite sports', activeUsers: 165, isTrending: false, category: 'Lifestyle' },
  { id: '9', name: 'Academics', description: 'Study groups and academic help', activeUsers: 178, isTrending: false, category: 'Education' },
  { id: '10', name: 'Videography', description: 'Video creation and editing tips', activeUsers: 92, isTrending: false, category: 'Creative' },
];

const SEARCH_SUGGESTIONS = [
  'Data Structures and Algorithms...',
  'Movies and Entertainment...',
  'Interview Preparation...',
  'System Design Concepts...',
  'Photography Tips...',
  'Sports Discussion...',
  'Academic Help...',
  'Job Placements...',
];

interface CommunitiesProps {
  onJoinCommunity: (communityId: string) => void;
  onBack: () => void;
}

const Communities: React.FC<CommunitiesProps> = ({ onJoinCommunity, onBack }) => {
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [showAddInterestModal, setShowAddInterestModal] = useState(false);
  const [filteredCommunities, setFilteredCommunities] = useState(MOCK_COMMUNITIES);

  // Rotate search suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter communities based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCommunities(MOCK_COMMUNITIES);
    } else {
      const filtered = MOCK_COMMUNITIES.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  }, [searchQuery]);

  // Sort communities - trending first
  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;
    return b.activeUsers - a.activeUsers;
  });

  const handleLogout = async () => {
    setUser(null);
    setToken(null);
    navigate('/');
  };

  const totalActiveUsers = MOCK_COMMUNITIES.reduce((sum, community) => sum + community.activeUsers, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        user={user as User}
        onProfileClick={() => navigate('/profile')}
        onLogoutClick={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Community
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Connect with <span className="font-semibold text-blue-600">{totalActiveUsers.toLocaleString()}</span> active students across different interests
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={SEARCH_SUGGESTIONS[currentSuggestion]}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => onJoinCommunity(community.id)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
            >
              {community.isTrending && (
                <div className="flex items-center mb-3">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending Now
                  </div>
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {community.name}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {community.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{community.activeUsers}</span>
                  <span className="text-gray-500 ml-1">online</span>
                </div>
                
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {community.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Can't Find Interest */}
        <div className="text-center">
          <button
            onClick={() => setShowAddInterestModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Can't find your interest?
          </button>
        </div>
      </main>

      <AddInterestModal
        isOpen={showAddInterestModal}
        onClose={() => setShowAddInterestModal(false)}
      />
    </div>
  );
};

export default Communities;