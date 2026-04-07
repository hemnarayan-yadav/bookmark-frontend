import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogIn, LogOut, Settings, Bookmark as BookmarkIcon, Mail, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <BookmarkIcon size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Bookmark Manager
              </h1>
            </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/public')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Public Bookmarks
              </button>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                        <button
                          onClick={() => { setShowUserMenu(false); navigate('/bookmarks'); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <BookmarkIcon size={16} />
                          My Bookmarks
                        </button>
                        <button
                          onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-red-600"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            We'd love to hear from you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get in Touch
              </h2>

              {/* Email */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Email
                  </h3>
                  <a 
                    href="mailto:hemnarayan.developer@gmail.com"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    hemnarayan.developer@gmail.com
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    We typically respond within 24-48 hours
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <BookmarkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Website
                  </h3>
                  <a 
                    href="https://bookmarksworld.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    https://bookmarksworld.store
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Visit our website for more information
                  </p>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Support Hours
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>

            <form 
              action={`mailto:hemnarayan.developer@gmail.com`}
              method="GET"
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="body"
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This will open your email client. You can also email us directly at{' '}
                <a href="mailto:hemnarayan.developer@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                  hemnarayan.developer@gmail.com
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How do I report a bug?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please email us with detailed information about the bug, including steps to reproduce it and screenshots if possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I request a feature?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! We love hearing feature requests from our users. Send us an email with your idea.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How do I delete my account?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can delete your account from the Profile Settings page. This action is permanent and cannot be undone.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! We use industry-standard encryption and security practices. Read our{' '}
                <button
                  onClick={() => navigate('/privacy-policy')}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Privacy Policy
                </button>
                {' '}for more details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/privacy-policy')}
            className="text-primary-600 dark:text-primary-400 hover:underline mr-6"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;