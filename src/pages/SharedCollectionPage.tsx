import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, FolderOpen, Eye, Users, Globe, ExternalLink, ArrowLeft, Tag } from 'lucide-react';
import { collectionAPI } from '../services/api';
import { Collection } from '../types';

const SharedCollectionPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchCollection();
    }
  }, [token]);

  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      const response = await collectionAPI.getShared(token!);
      if (response.success && response.data) {
        setCollection(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Collection not found');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collection Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'This collection may have been removed or the link is invalid.'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Collection Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: collection.color }}
            >
              {collection.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
              {collection.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{collection.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {collection.owner && (
              <span className="flex items-center gap-1">
                Shared by <strong className="text-gray-700 dark:text-gray-300">@{collection.owner.username}</strong>
              </span>
            )}
            <span className="flex items-center gap-1"><FolderOpen size={14} /> {collection.bookmarks.length} bookmarks</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {collection.view_count} views</span>
          </div>
        </div>

        {/* Bookmarks */}
        {collection.bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">This collection is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collection.bookmarks.map((bm) => (
              <a
                key={bm.id}
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all group block"
              >
                <div className="flex items-start gap-3">
                  {bm.favicon && (
                    <img src={bm.favicon} alt="" className="w-5 h-5 rounded mt-1 flex-shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 block truncate">
                        {bm.title}
                      </span>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-primary-600 flex-shrink-0 mt-1" />
                    </div>
                    {bm.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{bm.description}</p>
                    )}
                    {bm.tags && bm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bm.tags.map((t) => (
                          <span key={t.id} className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedCollectionPage;
