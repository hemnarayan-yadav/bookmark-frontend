import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Menu, AlertCircle } from 'lucide-react';
import { bookmarkAPI, tagAPI } from '../services/api';
import { Bookmark, Tag, Folder, CreateBookmarkDTO, UpdateBookmarkDTO } from '../types';
import BookmarkCard from '../components/BookmarkCard';
import BookmarkForm from '../components/BookmarkForm';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // ✅ Fetch folders + tags once auth is ready
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthLoading, isAuthenticated]);

  // ✅ Fetch bookmarks whenever filters or auth state changes
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthLoading, isAuthenticated, selectedFolder, selectedTag, searchQuery]);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [foldersRes, tagsRes] = await Promise.all([
        bookmarkAPI.getFolders(),
        tagAPI.getAll(),
      ]);
      
      if (foldersRes.success && foldersRes.data) {
        setFolders(foldersRes.data);
      }
      if (tagsRes.success && tagsRes.data) {
        setTags(tagsRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const params: any = {};
      if (selectedFolder) params.folder = selectedFolder;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery) params.search = searchQuery;

      const response = await bookmarkAPI.getAll(params);
      if (response.success && response.data) {
        setBookmarks(response.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const handleCreateBookmark = async (data: CreateBookmarkDTO) => {
    const response = await bookmarkAPI.create(data);
    if (response.success) {
      await fetchData();
      await fetchBookmarks();
    }
  };

  const handleUpdateBookmark = async (data: UpdateBookmarkDTO) => {
    if (!editingBookmark) return;
    const response = await bookmarkAPI.update(editingBookmark.id, data);
    if (response.success) {
      await fetchData();
      await fetchBookmarks();
    }
  };

  const handleTogglePrivacy = async (id: string) => {
    try {
      const bm = bookmarks.find((b) => b.id === id);
      if (!bm) return;
      await bookmarkAPI.update(id, { is_public: !bm.is_public });
      await fetchBookmarks();
    } catch (err) {
      console.error('Error toggling privacy:', err);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await bookmarkAPI.delete(id);
      await fetchData();
      await fetchBookmarks();
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };

  const handleOpenForm = (bookmark?: Bookmark) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
    } else {
      setEditingBookmark(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBookmark(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          folders={folders}
          tags={tags}
          selectedFolder={selectedFolder}
          selectedTag={selectedTag}
          onFolderSelect={setSelectedFolder}
          onTagSelect={setSelectedTag}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm">
            <div className="px-4 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Menu size={24} className="text-gray-600 dark:text-gray-400" />
                </button>

                {/* Search */}
                <div className="flex-1 max-w-2xl">
                  <SearchBar onSearch={setSearchQuery} />
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleOpenForm()}
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Add Bookmark</span>
                </button>
              </div>
            </div>
          </header>

          {/* Bookmarks Grid */}
          <div className="px-4 lg:px-8 py-8">
            {bookmarks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔖</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No bookmarks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery || selectedFolder || selectedTag
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by adding your first bookmark'}
                </p>
                {!searchQuery && !selectedFolder && !selectedTag && (
                  <button
                    onClick={() => handleOpenForm()}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Your First Bookmark
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteBookmark}
                    onTogglePrivacy={handleTogglePrivacy}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bookmark Form Modal */}
      {isFormOpen && (
        <BookmarkForm
          bookmark={editingBookmark}
          folders={folders.map(f => f.folder)}
          availableTags={tags.map(t => t.name)}
          onSubmit={editingBookmark ? handleUpdateBookmark : handleCreateBookmark}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default BookmarksPage;