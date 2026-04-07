import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogIn, LogOut, Settings, Bookmark as BookmarkIcon, Shield, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const PrivacyPolicyPage: React.FC = () => {
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
            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: December 2, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account (username, email, password)</li>
                <li>Add, edit, or organize bookmarks</li>
                <li>Update your profile information</li>
                <li>Use our services and features</li>
              </ul>
              <p className="mt-4">
                <strong>Personal Data:</strong> Username, email address, full name (optional), and profile avatar URL (optional).
              </p>
              <p>
                <strong>Bookmark Data:</strong> URLs, titles, descriptions, tags, folders, and privacy settings (public/private).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Store and organize your bookmarks</li>
                <li>Enable public sharing of bookmarks (only if you choose to make them public)</li>
                <li>Send you service-related communications</li>
                <li>Respond to your support requests</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                <strong>We do not sell your personal information.</strong>
              </p>
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Public Bookmarks:</strong> If you mark a bookmark as "public," it will be visible to all users of the service.</li>
                <li><strong>With Your Consent:</strong> We may share information with third parties when you explicitly consent.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
                <li><strong>Service Providers:</strong> We may share data with service providers who help us operate our service (e.g., hosting providers).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Passwords are encrypted using bcrypt hashing</li>
                <li>Secure JWT token-based authentication</li>
                <li>HTTPS encryption for data transmission</li>
                <li>Regular security updates and monitoring</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Your Privacy Rights
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Edit:</strong> Update your profile information at any time</li>
                <li><strong>Delete:</strong> Delete your account and all associated data</li>
                <li><strong>Control:</strong> Choose which bookmarks are public or private</li>
                <li><strong>Export:</strong> Request an export of your bookmark data</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at: <a href="mailto:hemnarayan.developer@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">hemnarayan.developer@gmail.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Cookies and Tracking
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                We use localStorage to store:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication tokens (to keep you logged in)</li>
                <li>Theme preferences (light/dark mode)</li>
                <li>User profile information</li>
              </ul>
              <p className="mt-4">
                This data is stored locally on your device and is not transmitted to third parties.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Children's Privacy
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Data Retention
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                We retain your information for as long as your account is active or as needed to provide you services. You can delete your account at any time, which will permanently delete all your data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> <a href="mailto:hemnarayan.developer@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">hemnarayan.developer@gmail.com</a></li>
                <li><strong>Website:</strong> <a href="https://bookmarksworld.store" className="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">https://bookmarksworld.store</a></li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/contact')}
            className="text-primary-600 dark:text-primary-400 hover:underline mr-6"
          >
            Contact Us
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

export default PrivacyPolicyPage;