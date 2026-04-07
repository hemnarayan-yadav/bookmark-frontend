import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, LogIn, LogOut, Settings, Bookmark as BookmarkIcon,
  Globe, Lock, Search, FolderOpen, Heart, Share2, Tag, BarChart3,
  Download, Upload, Users, Shield, Zap, ArrowRight, Chrome, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/api';
import { PlatformStats } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    statsAPI.getPlatform().then((res) => {
      if (res.success && res.data) setPlatformStats(res.data);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const features = [
    { icon: <FolderOpen className="w-7 h-7" />, title: "Collections", desc: "Group bookmarks into shareable collections with collaborators", color: "from-blue-500 to-cyan-500" },
    { icon: <Heart className="w-7 h-7" />, title: "Favorites", desc: "Heart the best bookmarks and access them instantly", color: "from-pink-500 to-rose-500" },
    { icon: <Tag className="w-7 h-7" />, title: "Smart Tags", desc: "Auto-categorize with tags and find anything in seconds", color: "from-purple-500 to-violet-500" },
    { icon: <Globe className="w-7 h-7" />, title: "Public Sharing", desc: "Share discoveries with the community or keep them private", color: "from-green-500 to-emerald-500" },
    { icon: <BarChart3 className="w-7 h-7" />, title: "Analytics", desc: "Track your bookmarking habits with a beautiful dashboard", color: "from-orange-500 to-amber-500" },
    { icon: <Share2 className="w-7 h-7" />, title: "Collaboration", desc: "Invite others as viewers or editors on your collections", color: "from-indigo-500 to-blue-500" },
    { icon: <Download className="w-7 h-7" />, title: "Import / Export", desc: "Bring bookmarks from any browser or export as JSON/HTML", color: "from-teal-500 to-cyan-500" },
    { icon: <Chrome className="w-7 h-7" />, title: "Browser Extension", desc: "Save any page with one click using our Chrome extension", color: "from-red-500 to-pink-500" },
  ];

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up for free in seconds" },
    { num: "02", title: "Save Bookmarks", desc: "Add links via web, extension, or import" },
    { num: "03", title: "Organize", desc: "Use folders, tags, and collections" },
    { num: "04", title: "Share & Discover", desc: "Go public or explore community links" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <BookmarkIcon size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Bookmarks World</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 font-medium text-sm">Home</button>
              <button onClick={() => navigate('/public')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">Explore</button>
              {isAuthenticated && (
                <>
                  <button onClick={() => navigate('/bookmarks')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">My Bookmarks</button>
                  <button onClick={() => navigate('/dashboard')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">Dashboard</button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                {theme === 'dark' ? <Moon size={18} className="text-gray-400" /> : <Sun size={18} className="text-gray-400" />}
              </button>
              {isAuthenticated && user ? (
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">{user.username}</span>
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
                        <button onClick={() => { setShowUserMenu(false); navigate('/collections'); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm">
                          <FolderOpen size={15} /> Collections
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
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium">
                    Sign In
                  </button>
                  <button onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-purple-600/5 to-pink-500/5 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute top-40 right-40 w-48 h-48 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Free & Open Source Bookmark Manager
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              Your Bookmarks,{' '}
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Organized
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Save, organize, and share your favorite links. Collections, tags, favorites, analytics — everything you need in one place.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <>
                  <button onClick={() => navigate('/bookmarks')}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                    Go to Bookmarks <ArrowRight size={20} />
                  </button>
                  <button onClick={() => navigate('/public')}
                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all font-semibold text-lg">
                    Explore Public
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/register')}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                    Get Started Free <ArrowRight size={20} />
                  </button>
                  <button onClick={() => navigate('/public')}
                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all font-semibold text-lg">
                    Browse Public
                  </button>
                </>
              )}
            </div>

            {/* Live Stats */}
            {platformStats && (
              <div className="flex items-center justify-center gap-8 md:gap-12 mt-14">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{platformStats.total_users}+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Users</div>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{platformStats.total_public_bookmarks}+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Public Bookmarks</div>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{platformStats.total_public_collections}+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Collections</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Get started in under a minute</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Everything You Need</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete bookmark management platform with features you'll actually use
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security / Trust */}
      <div className="bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure by Default</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">JWT auth, encrypted passwords, CORS protection</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Optimized API with indexed database queries</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy First</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your private bookmarks stay private. Always.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="relative max-w-4xl mx-auto px-4 lg:px-8 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to organize your web?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join our growing community. Free forever, no credit card required.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl text-lg">
                Create Free Account
              </button>
              <button onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-lg">
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <BookmarkIcon size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Bookmarks World</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/public')} className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">Explore</button>
              <button onClick={() => navigate('/privacy-policy')} className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">Privacy</button>
              <button onClick={() => navigate('/contact')} className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors">Contact</button>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">© 2024 Bookmarks World. Made by Hemnarayan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;