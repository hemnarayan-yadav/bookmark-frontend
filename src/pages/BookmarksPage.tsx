import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Menu, AlertCircle, Trash2, FolderOpen, Tag, CheckSquare, X } from 'lucide-react';
import { bookmarkAPI, tagAPI, favoriteAPI, collectionAPI } from '../services/api';
import { Bookmark, Tag as TagType, Folder, CreateBookmarkDTO, UpdateBookmarkDTO, Collection } from '../types';
import BookmarkCard from '../components/BookmarkCard';
import BookmarkForm from '../components/BookmarkForm';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New: Favorites
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // New: Bulk selection
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkFolder, setBulkFolder] = useState('');
  const [bulkTags, setBulkTags] = useState('');

  // New: Add to collection
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [addBookmarkToCol, setAddBookmarkToCol] = useState<Bookmark | null>(null);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthLoading, isAuthenticated]);

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

      // Fetch favorite IDs separately so it doesn't block page load
      try {
        const favRes = await favoriteAPI.getIds();
        if (favRes.success && favRes.data) {
          setFavoriteIds(new Set(favRes.data));
        }
      } catch {
        // silently ignore — favorites are non-critical
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

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await favoriteAPI.toggle(id);
      if (response.success && response.data) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (response.data!.favorited) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleAddToCollection = async (bookmark: Bookmark) => {
    setAddBookmarkToCol(bookmark);
    setShowCollectionPicker(true);
    try {
      const response = await collectionAPI.getAll();
      if (response.success && response.data) {
        setCollections(response.data);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const handlePickCollection = async (collectionId: string) => {
    if (!addBookmarkToCol) return;
    try {
      await collectionAPI.addBookmark(collectionId, addBookmarkToCol.id);
      setShowCollectionPicker(false);
      setAddBookmarkToCol(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add to collection');
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

  // Bulk operations
  const handleSelectBookmark = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === bookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map((b) => b.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} bookmarks?`)) return;
    try {
      await bookmarkAPI.bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkMode(false);
      await fetchData();
      await fetchBookmarks();
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  const handleBulkMove = async () => {
    if (!bulkFolder.trim()) return;
    try {
      await bookmarkAPI.bulkMove(Array.from(selectedIds), bulkFolder);
      setSelectedIds(new Set());
      setBulkMode(false);
      setBulkAction(null);
      setBulkFolder('');
      await fetchData();
      await fetchBookmarks();
    } catch (err) {
      console.error('Bulk move error:', err);
    }
  };

  const handleBulkTag = async () => {
    if (!bulkTags.trim()) return;
    const tagList = bulkTags.split(',').map((t) => t.trim()).filter(Boolean);
    try {
      await bookmarkAPI.bulkTag(Array.from(selectedIds), tagList);
      setSelectedIds(new Set());
      setBulkMode(false);
      setBulkAction(null);
      setBulkTags('');
      await fetchData();
      await fetchBookmarks();
    } catch (err) {
      console.error('Bulk tag error:', err);
    }
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

                {/* Bulk Mode Toggle */}
                <button
                  onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
                  className={`p-2 rounded-lg transition-colors ${bulkMode ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  title="Bulk select mode"
                >
                  <CheckSquare size={20} />
                </button>

                {/* Add Button */}
                <button
                  onClick={() => handleOpenForm()}
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Add Bookmark</span>
                </button>
              </div>

              {/* Bulk Action Bar */}
              {bulkMode && selectedIds.size > 0 && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {selectedIds.size} selected
                  </span>
                  <button onClick={handleSelectAll} className="text-xs text-primary-600 hover:underline">
                    {selectedIds.size === bookmarks.length ? 'Deselect all' : 'Select all'}
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setBulkAction('move')}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                  >
                    <FolderOpen size={14} /> Move
                  </button>
                  <button
                    onClick={() => setBulkAction('tag')}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                  >
                    <Tag size={14} /> Tag
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
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
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCollection={handleAddToCollection}
                    isFavorited={favoriteIds.has(bookmark.id)}
                    isSelected={selectedIds.has(bookmark.id)}
                    onSelect={bulkMode ? handleSelectBookmark : undefined}
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

      {/* Bulk Move Modal */}
      {bulkAction === 'move' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Move to Folder</h3>
            <input
              type="text"
              value={bulkFolder}
              onChange={(e) => setBulkFolder(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
              list="bulk-folders"
            />
            <datalist id="bulk-folders">
              {folders.map((f) => <option key={f.folder} value={f.folder} />)}
            </datalist>
            <div className="flex gap-3">
              <button onClick={() => { setBulkAction(null); setBulkFolder(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleBulkMove} className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Move</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tag Modal */}
      {bulkAction === 'tag' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Tags</h3>
            <input
              type="text"
              value={bulkTags}
              onChange={(e) => setBulkTags(e.target.value)}
              placeholder="Comma separated tags"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setBulkAction(null); setBulkTags(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleBulkTag} className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Add Tags</button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Picker Modal */}
      {showCollectionPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add to Collection</h3>
              <button onClick={() => { setShowCollectionPicker(false); setAddBookmarkToCol(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {collections.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No collections yet. Create one first!</p>
              ) : (
                collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handlePickCollection(col.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border border-gray-100 dark:border-gray-700"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: col.color }}
                    >
                      {col.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{col.name}</div>
                      <div className="text-xs text-gray-500">{col.bookmark_count} bookmarks</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;