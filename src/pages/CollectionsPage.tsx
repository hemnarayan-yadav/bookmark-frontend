import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Loader2, FolderOpen, Share2, Users, Eye, Trash2, Edit2,
  Globe, Lock, Link2, Copy, Check, X, ArrowLeft, Search
} from 'lucide-react';
import { collectionAPI, bookmarkAPI } from '../services/api';
import { Collection, CreateCollectionDTO, Bookmark } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCollection, setShareCollection] = useState<Collection | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Add bookmark to collection
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]);
  const [addToCollectionId, setAddToCollectionId] = useState<string | null>(null);

  // Collaborator state
  const [collaboratorUsername, setCollaboratorUsername] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthLoading, isAuthenticated]);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await collectionAPI.getAll();
      if (response.success && response.data) {
        setCollections(response.data);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const data: CreateCollectionDTO = {
        name: formName,
        description: formDescription || undefined,
        color: formColor,
        is_public: formIsPublic,
      };
      if (editingCollection) {
        await collectionAPI.update(editingCollection.id, data);
      } else {
        await collectionAPI.create(data);
      }
      resetForm();
      await fetchCollections();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#3b82f6');
    setFormIsPublic(false);
    setShowCreateForm(false);
    setEditingCollection(null);
    setFormError('');
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormName(collection.name);
    setFormDescription(collection.description || '');
    setFormColor(collection.color);
    setFormIsPublic(collection.is_public);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Bookmarks inside will not be deleted.')) return;
    try {
      await collectionAPI.delete(id);
      if (selectedCollection?.id === id) setSelectedCollection(null);
      await fetchCollections();
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  };

  const handleViewCollection = async (collection: Collection) => {
    try {
      const response = await collectionAPI.getById(collection.id);
      if (response.success && response.data) {
        setSelectedCollection(response.data);
      }
    } catch (err) {
      console.error('Error fetching collection details:', err);
    }
  };

  const handleShare = async (collection: Collection) => {
    setShareCollection(collection);
    setShowShareModal(true);
    if (!collection.share_token) {
      try {
        const response = await collectionAPI.generateShareLink(collection.id);
        if (response.success && response.data) {
          setShareCollection({ ...collection, share_token: response.data.share_token });
          await fetchCollections();
        }
      } catch (err) {
        console.error('Error generating share link:', err);
      }
    }
  };

  const copyShareLink = () => {
    if (shareCollection?.share_token) {
      const link = `${window.location.origin}/shared/${shareCollection.share_token}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddCollaborator = async () => {
    if (!shareCollection || !collaboratorUsername.trim()) return;
    try {
      await collectionAPI.addCollaborator(shareCollection.id, collaboratorUsername, collaboratorRole);
      setCollaboratorUsername('');
      await fetchCollections();
      // Refresh the share modal data
      const updated = await collectionAPI.getById(shareCollection.id);
      if (updated.success && updated.data) {
        setShareCollection(updated.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!shareCollection) return;
    try {
      await collectionAPI.removeCollaborator(shareCollection.id, userId);
      await fetchCollections();
      const updated = await collectionAPI.getById(shareCollection.id);
      if (updated.success && updated.data) {
        setShareCollection(updated.data);
      }
    } catch (err) {
      console.error('Error removing collaborator:', err);
    }
  };

  const handleOpenAddBookmark = async (collectionId: string) => {
    setAddToCollectionId(collectionId);
    setShowAddBookmark(true);
    try {
      const response = await bookmarkAPI.getAll();
      if (response.success && response.data) {
        setUserBookmarks(response.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const handleAddBookmarkToCollection = async (bookmarkId: string) => {
    if (!addToCollectionId) return;
    try {
      await collectionAPI.addBookmark(addToCollectionId, bookmarkId);
      if (selectedCollection?.id === addToCollectionId) {
        await handleViewCollection(selectedCollection);
      }
      await fetchCollections();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add bookmark');
    }
  };

  const handleRemoveBookmarkFromCollection = async (bookmarkId: string) => {
    if (!selectedCollection) return;
    try {
      await collectionAPI.removeBookmark(selectedCollection.id, bookmarkId);
      await handleViewCollection(selectedCollection);
      await fetchCollections();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  // Collection Detail View
  if (selectedCollection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Collections
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: selectedCollection.color }}
                >
                  {selectedCollection.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCollection.name}
                  </h1>
                  {selectedCollection.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedCollection.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FolderOpen size={14} /> {selectedCollection.bookmarks.length} bookmarks
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {selectedCollection.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {selectedCollection.collaborators.length} collaborators
                    </span>
                    <span className={`flex items-center gap-1 ${selectedCollection.is_public ? 'text-green-600' : 'text-gray-500'}`}>
                      {selectedCollection.is_public ? <Globe size={14} /> : <Lock size={14} />}
                      {selectedCollection.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenAddBookmark(selectedCollection.id)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Add Bookmark
                </button>
                <button
                  onClick={() => handleShare(selectedCollection)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Bookmarks in collection */}
          {selectedCollection.bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add bookmarks to this collection to get started</p>
              <button
                onClick={() => handleOpenAddBookmark(selectedCollection.id)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} className="inline mr-2" />
                Add Bookmarks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedCollection.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {bm.favicon && (
                      <img src={bm.favicon} alt="" className="w-5 h-5 rounded mt-1 flex-shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate"
                      >
                        {bm.title}
                      </a>
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
                    <button
                      onClick={() => handleRemoveBookmarkFromCollection(bm.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove from collection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Bookmark Modal */}
        {showAddBookmark && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Bookmark to Collection</h3>
                <button onClick={() => setShowAddBookmark(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {userBookmarks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bookmarks found. Create some first!</p>
                ) : (
                  userBookmarks.map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => handleAddBookmarkToCollection(bm.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border border-gray-100 dark:border-gray-700"
                    >
                      {bm.favicon && (
                        <img src={bm.favicon} alt="" className="w-4 h-4 rounded flex-shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{bm.title}</div>
                        <div className="text-xs text-gray-500 truncate">{bm.url}</div>
                      </div>
                      <Plus size={16} className="text-primary-600 flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Collections List View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Organize bookmarks into curated groups and share with others</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/bookmarks')}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              My Bookmarks
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              New Collection
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No collections found' : 'No collections yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try a different search' : 'Create your first collection to organize bookmarks'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Collection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Color bar */}
                <div className="h-2" style={{ backgroundColor: collection.color }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
                      style={{ backgroundColor: collection.color }}
                      onClick={() => handleViewCollection(collection)}
                    >
                      {collection.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleShare(collection)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors" title="Share">
                        <Share2 size={16} />
                      </button>
                      <button onClick={() => handleEdit(collection)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(collection.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => handleViewCollection(collection)}
                  >
                    {collection.name}
                  </h3>

                  {collection.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FolderOpen size={12} /> {collection.bookmark_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {collection.view_count}
                      </span>
                      {collection.collaborators.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {collection.collaborators.length}
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 ${collection.is_public ? 'text-green-600' : ''}`}>
                      {collection.is_public ? <Globe size={12} /> : <Lock size={12} />}
                      {collection.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCollection ? 'Edit Collection' : 'New Collection'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Web Development Resources"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What's this collection about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${formColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formIsPublic} onChange={(e) => setFormIsPublic(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">Make public</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editingCollection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareCollection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Collection</h2>
              <button onClick={() => { setShowShareModal(false); setShareCollection(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Link2 size={14} className="inline mr-1" /> Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareCollection.share_token ? `${window.location.origin}/shared/${shareCollection.share_token}` : 'Generating...'}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Add Collaborator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users size={14} className="inline mr-1" /> Add Collaborator
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={collaboratorUsername}
                    onChange={(e) => setCollaboratorUsername(e.target.value)}
                    placeholder="Username"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <select
                    value={collaboratorRole}
                    onChange={(e) => setCollaboratorRole(e.target.value as 'viewer' | 'editor')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button onClick={handleAddCollaborator} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm">
                    Add
                  </button>
                </div>
              </div>

              {/* Current Collaborators */}
              {shareCollection.collaborators && shareCollection.collaborators.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collaborators</label>
                  <div className="space-y-2">
                    {shareCollection.collaborators.map((collab) => (
                      <div key={collab.user_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {collab.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">@{collab.username}</div>
                            <div className="text-xs text-gray-500 capitalize">{collab.role}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCollaborator(collab.user_id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
