import React from 'react';
import { ExternalLink, Edit2, Trash2, Tag, Globe, Lock } from 'lucide-react';
import { Bookmark } from '../types';
import { formatDate, extractDomain, truncateText } from '../utils/helpers';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: number) => void;
  onTogglePrivacy?: (id: number) => void;
  showActions?: boolean;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  onTogglePrivacy,
  showActions = true
}) => {
  const handleFaviconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/16x16?text=🔖';
  };

  return (
    <div className="bookmark-card bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0 mt-1">
          <img
            src={bookmark.favicon || 'https://via.placeholder.com/16x16?text=🔖'}
            alt="favicon"
            className="w-5 h-5 rounded"
            onError={handleFaviconError}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0 relative group">
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white truncate whitespace-nowrap overflow-hidden line-clamp-1"
              >
                {bookmark.title}
              </h3>

              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block w-64 p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 whitespace-normal break-words max-h-48 overflow-auto">
                {bookmark.title}
              </div>
              {/* Privacy Badge */}
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${bookmark.is_public
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  {bookmark.is_public ? <Globe size={12} /> : <Lock size={12} />}
                  {bookmark.is_public ? 'Public' : 'Private'}
                </span>
                {bookmark.user && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    by @{bookmark.user.username}
                  </span>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded transition-colors"
                  title="Open link"
                >
                  <ExternalLink size={16} />
                </button>
                {onTogglePrivacy && (
                  <button
                    onClick={() => onTogglePrivacy(bookmark.id)}
                    className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded transition-colors"
                    title={`Make ${bookmark.is_public ? 'private' : 'public'}`}
                  >
                    {bookmark.is_public ? <Lock size={16} /> : <Globe size={16} />}
                  </button>
                )}
                <button
                  onClick={() => onEdit(bookmark)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* URL */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline block mb-2 truncate"
          >
            {extractDomain(bookmark.url)}
          </a>

          {/* Description */}
          {bookmark.description && (
            <div className="relative group">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {truncateText(bookmark.description, 150)}
              </p>

              {/* Tooltip with full text on hover */}
              <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block w-64 p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 whitespace-normal break-words max-h-48 overflow-auto">
                {bookmark.description}
              </div>
            </div>
          )}



          {/* Tags and Meta */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {bookmark.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                    >
                      <Tag size={12} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatDate(bookmark.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;