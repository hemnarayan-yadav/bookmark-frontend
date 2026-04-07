import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, FolderOpen, Tag, Heart, Globe, Lock, TrendingUp,
  ArrowLeft, Loader2, Download, Upload, BarChart3, Activity,
  ExternalLink, Clock
} from 'lucide-react';
import { statsAPI, bookmarkAPI } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_LABELS: Record<string, string> = {
  bookmark_created: 'Created a bookmark',
  bookmark_deleted: 'Deleted a bookmark',
  bookmark_shared: 'Shared a bookmark',
  collection_created: 'Created a collection',
  collection_shared: 'Shared a collection',
  bookmark_favorited: 'Favorited a bookmark',
  profile_updated: 'Updated profile',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchStats();
    }
  }, [isAuthLoading, isAuthenticated]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await statsAPI.getDashboard();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await bookmarkAPI.exportBookmarks('json');
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarks.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleExportHTML = async () => {
    try {
      const blob = await bookmarkAPI.exportBookmarks('html');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookmarks.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const bookmarks = JSON.parse(importData);
      const response = await bookmarkAPI.importBookmarks(Array.isArray(bookmarks) ? bookmarks : [bookmarks]);
      if (response.success && response.data) {
        setImportResult(response.data);
        await fetchStats();
      }
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setImportResult({ error: 'Invalid JSON format' });
      } else {
        setImportResult({ error: err.response?.data?.error || 'Import failed' });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  const maxMonthCount = Math.max(...stats.bookmarks_by_month.map(b => b.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 size={32} className="text-primary-600" />
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Your bookmarking analytics at a glance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Upload size={16} /> Import
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download size={16} /> Export
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <button onClick={handleExportJSON} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors rounded-t-lg">
                  Export as JSON
                </button>
                <button onClick={handleExportHTML} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors rounded-b-lg">
                  Export as HTML (Browser)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Bookmarks', value: stats.overview.total_bookmarks, icon: Bookmark, color: 'bg-blue-500' },
            { label: 'Public', value: stats.overview.public_bookmarks, icon: Globe, color: 'bg-green-500' },
            { label: 'Private', value: stats.overview.private_bookmarks, icon: Lock, color: 'bg-gray-500' },
            { label: 'Collections', value: stats.overview.total_collections, icon: FolderOpen, color: 'bg-purple-500' },
            { label: 'Tags', value: stats.overview.total_tags, icon: Tag, color: 'bg-orange-500' },
            { label: 'Favorites', value: stats.overview.total_favorites, icon: Heart, color: 'bg-red-500' },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                <card.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookmarks Over Time Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" />
              Bookmarks Over Time
            </h2>
            {stats.bookmarks_by_month.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data yet</p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {stats.bookmarks_by_month.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{m.count}</span>
                    <div
                      className="w-full bg-primary-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{ height: `${(m.count / maxMonthCount) * 160}px` }}
                    />
                    <span className="text-[10px] text-gray-500">{MONTH_NAMES[m.month - 1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Domains */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ExternalLink size={20} className="text-primary-600" />
              Top Domains
            </h2>
            {stats.top_domains.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.top_domains.map((d, i) => {
                  const maxDomain = stats.top_domains[0]?.count || 1;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 truncate">{d.domain}</span>
                        <span className="text-gray-500 font-medium">{d.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 rounded-full h-2 transition-all"
                          style={{ width: `${(d.count / maxDomain) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Folders Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderOpen size={20} className="text-purple-600" />
              Folders
            </h2>
            {stats.folders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No folders yet</p>
            ) : (
              <div className="space-y-2">
                {stats.folders.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-sm font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">{f.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag size={20} className="text-orange-600" />
              Top Tags
            </h2>
            {stats.top_tags.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.top_tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                  >
                    {t.name}
                    <span className="text-xs opacity-70">({t.count})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-green-600" />
              Recent Activity
            </h2>
            {stats.recent_activity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recent_activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300">
                        {ACTIVITY_LABELS[a.type] || a.type}
                      </p>
                      {a.metadata?.title && (
                        <p className="text-xs text-gray-500 truncate">{a.metadata.title}</p>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Bookmarks</h2>
              <button onClick={() => { setShowImport(false); setImportResult(null); setImportData(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <span className="text-gray-500 text-xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste JSON array of bookmarks or upload a file. Each bookmark should have at least a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">url</code> field.
                Optional: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">title</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">description</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">folder</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">tags</code>.
              </p>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300"
                />
              </div>

              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder='[{"url": "https://...", "title": "...", "folder": "Dev", "tags": ["react"]}]'
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm font-mono resize-none focus:ring-2 focus:ring-primary-500"
              />

              {importResult && (
                <div className={`p-3 rounded-lg text-sm ${importResult.error ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                  {importResult.error ? (
                    importResult.error
                  ) : (
                    <div>
                      <strong>Imported: {importResult.imported}</strong> | Skipped: {importResult.skipped}
                      {importResult.errors?.length > 0 && (
                        <ul className="mt-1 text-xs">
                          {importResult.errors.map((e: string, i: number) => <li key={i}>- {e}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={isImporting || !importData.trim()}
                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Import Bookmarks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
