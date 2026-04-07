import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, ExternalLink, Tag, X, ArrowLeft } from 'lucide-react';
import { favoriteAPI } from '../services/api';
import { Bookmark } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate, extractDomain, truncateText } from '../utils/helpers';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [favorites, setFavorites] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthLoading, isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await favoriteAPI.getAll();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfavorite = async (bookmarkId: string) => {
    try {
      await favoriteAPI.toggle(bookmarkId);
      setFavorites(favorites.filter((f) => f.id !== bookmarkId));
    } catch (err) {
      console.error('Error unfavoriting:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Heart size={32} className="text-red-500" fill="currentColor" />
            Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your favorited bookmarks from across the platform
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click the heart icon on any bookmark to add it to your favorites
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((bm) => (
              <div
                key={bm.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  {bm.favicon && (
                    <img
                      src={bm.favicon}
                      alt=""
                      className="w-5 h-5 rounded mt-1 flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate"
                      >
                        {bm.title}
                      </a>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => handleUnfavorite(bm.id)}
                          className="p-1 text-red-500 hover:text-red-600 transition-colors"
                          title="Remove from favorites"
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>

                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline block mt-0.5"
                    >
                      {extractDomain(bm.url)}
                    </a>

                    {bm.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {truncateText(bm.description, 120)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {bm.tags?.length > 0 && bm.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                        >
                          <Tag size={10} />
                          {tag.name}
                        </span>
                      ))}
                      {bm.user && (
                        <span className="text-xs text-gray-500">by @{bm.user.username}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
