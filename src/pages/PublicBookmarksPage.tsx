import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Search, Moon, Sun, LogIn, LogOut, Settings,
  Bookmark as BookmarkIcon, X, Filter, ArrowLeft, Globe,
  Users, TrendingUp, ExternalLink, Tag, Sparkles
} from 'lucide-react';
import { publicAPI, statsAPI } from '../services/api';
import { Bookmark, Tag as TagType, PlatformStats } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { extractDomain, truncateText } from '../utils/helpers';

const TAG_COLORS = [
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
];

const PublicBookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [popularTags, setPopularTags] = useState<TagType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPopularTags();
    fetchPlatformStats();
  }, []);

  useEffect(() => {
    fetchPublicBookmarks();
  }, [searchQuery, selectedTag]);

  const fetchPlatformStats = async () => {
    try {
      const response = await statsAPI.getPlatform();
      if (response.success && response.data) {
        setPlatformStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await publicAPI.getPopularTags(20);
      if (response.success && response.data) {
        setPopularTags(response.data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const fetchPublicBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await publicAPI.getBookmarks({
        search: searchQuery || undefined,
        tag: selectedTag || undefined,
        limit: 50,
      });
      if (response.success && response.data) {
        setBookmarks(response.data);
      }
    } catch (err) {
      console.error('Error fetching public bookmarks:', err);
      setError('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <BookmarkIcon size={20} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white hidden sm:block">Bookmarks World</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Moon size={18} className="text-gray-400" /> : <Sun size={18} className="text-gray-400" />}
              </button>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-600">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.full_name || user.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                        </div>
                        <button onClick={() => { setShowUserMenu(false); navigate('/bookmarks'); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm">
                          <BookmarkIcon size={15} /> My Bookmarks
                        </button>
                        <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm">
                          <Settings size={15} /> Settings
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-600" />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 text-sm">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                  <LogIn size={16} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-300/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Explore Community Bookmarks
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Discover Amazing Links
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Browse thousands of curated bookmarks shared by our community. Find tools, articles, resources and more.
            </p>

            {/* Search */}
            <div className="w-full max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks, tags, or authors..."
                className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-gray-900 dark:text-white placeholder-gray-400 text-lg focus:ring-4 focus:ring-white/30 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Platform Stats */}
            {platformStats && (
              <div className="flex items-center gap-8 mt-8 text-white/90">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span className="font-semibold">{platformStats.total_users}</span>
                  <span className="text-white/60 text-sm">users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span className="font-semibold">{platformStats.total_public_bookmarks}</span>
                  <span className="text-white/60 text-sm">bookmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} />
                  <span className="font-semibold">{platformStats.total_public_collections}</span>
                  <span className="text-white/60 text-sm">collections</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Tags */}
      {popularTags.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-6 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Trending Tags</h3>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, i) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag.name
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : TAG_COLORS[i % TAG_COLORS.length] + ' hover:scale-105'
                  }`}
                >
                  #{tag.name}
                  {tag.usage_count !== undefined && (
                    <span className="ml-1.5 opacity-60 text-xs">({tag.usage_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-3 py-1 mb-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                <Tag size={12} /> {selectedTag}
                <button onClick={() => setSelectedTag(null)} className="ml-1"><X size={12} /></button>
              </span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Searching...' : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Discovering bookmarks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={36} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookmarks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || selectedTag
                ? 'Try adjusting your filters or search query'
                : 'Be the first to share a public bookmark!'}
            </p>
            {isAuthenticated && (
              <button onClick={() => navigate('/bookmarks')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium">
                Go to My Bookmarks
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookmarks.map((bm) => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3 mb-3">
                  {bm.favicon ? (
                    <img src={bm.favicon} alt="" className="w-8 h-8 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Globe size={16} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 text-sm">
                      {bm.title}
                    </h3>
                    <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5 truncate">
                      {extractDomain(bm.url)}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                </div>

                {bm.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {truncateText(bm.description, 120)}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {bm.tags?.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  {bm.user && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">@{bm.user.username}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all"
              >
                {bm.favicon ? (
                  <img src={bm.favicon} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-1.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {bm.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {bm.description || extractDomain(bm.url)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {bm.tags?.slice(0, 2).map((tag) => (
                    <span key={tag.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs hidden md:inline">
                      #{tag.name}
                    </span>
                  ))}
                  {bm.user && <span className="text-xs text-gray-400">@{bm.user.username}</span>}
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 mt-12">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Start saving your bookmarks today</h2>
            <p className="text-white/70 mb-6">Join our community and never lose an important link again.</p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                Get Started Free
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicBookmarksPage;