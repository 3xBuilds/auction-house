'use client';

import { useEffect, useState } from 'react';
import { useGlobalContext } from '@/utils/providers/globalContext';
import { getAccessToken, usePrivy } from '@privy-io/react-auth';
import { Shield, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/UI/table';
import Heading from '@/components/UI/Heading';
import Input from '@/components/UI/Input';
import { Button } from '@/components/UI/button';

interface WhitelistEntry {
  _id: string;
  walletAddress: string;
  nickname?: string;
  addedBy?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { user } = useGlobalContext();
  const { authenticated } = usePrivy();
  const [whitelists, setWhitelists] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WhitelistEntry | null>(null);
  const [newWallet, setNewWallet] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user has admin access
  useEffect(() => {
    if (user?.socialId) {
      const adminStatus = user.socialId == "666038" || user.socialId == "1129842";
      setIsAdmin(adminStatus);
      console.log('Admin check:', { socialId: user.socialId, isAdmin: adminStatus });
    }
  }, [user?.socialId]);

  useEffect(() => {
    if (authenticated && isAdmin) {
      fetchWhitelists();
    }
  }, [authenticated, isAdmin]);

  const fetchWhitelists = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      const response = await fetch('/api/admin/whitelist/list', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch whitelists');
      }

      const data = await response.json();
      setWhitelists(data.whitelists);
    } catch (error) {
      console.error('Error fetching whitelists:', error);
      toast.error('Failed to load whitelists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!newWallet) {
      toast.error('Wallet address is required');
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/admin/whitelist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletAddress: newWallet,
          nickname: newNickname || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to add wallet');
        return;
      }

      toast.success('Wallet added successfully');
      setNewWallet('');
      setNewNickname('');
      setShowAddModal(false);
      fetchWhitelists();
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add wallet');
    }
  };

  const handleUpdateWallet = async () => {
    if (!editingEntry) return;

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/admin/whitelist/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletAddress: editingEntry.walletAddress,
          nickname: newNickname,
          status: editingEntry.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update wallet');
        return;
      }

      toast.success('Wallet updated successfully');
      setEditingEntry(null);
      setNewNickname('');
      fetchWhitelists();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    }
  };

  const handleDeleteWallet = async (walletAddress: string) => {
    if (!confirm('Are you sure you want to remove this wallet from the whitelist?')) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/admin/whitelist/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to remove wallet');
        return;
      }

      toast.success('Wallet removed successfully');
      fetchWhitelists();
    } catch (error) {
      console.error('Error removing wallet:', error);
      toast.error('Failed to remove wallet');
    }
  };

  const handleToggleStatus = async (entry: WhitelistEntry) => {
    const newStatus = entry.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/admin/whitelist/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletAddress: entry.walletAddress,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update status');
        return;
      }

      toast.success(`Status changed to ${newStatus}`);
      fetchWhitelists();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl mb-2">Access Denied</h2>
          <p className="text-gray-400">
            Please login to access admin panel
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You don't have permission to access the admin panel
          </p>
        </div>
      </div>
    );
  }

  const filteredWhitelist = whitelists.filter(
    entry =>
      entry.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl">Admin Panel</h1>
              <p className="text-gray-400">Manage whitelist and platform settings</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by address or nickname..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Whitelist Table */}
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Address</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Nickname</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Added Date</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredWhitelist.map((entry, index) => (
                      <motion.tr
                        key={entry._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <code className="text-sm text-purple-400">{entry.walletAddress}</code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">{entry.nickname || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              entry.status === 'ACTIVE'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setEditingEntry(entry);
                                setNewNickname(entry.nickname || '');
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button 
                              onClick={() => handleDeleteWallet(entry.walletAddress)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredWhitelist.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No entries found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 rounded-xl bg-[#0f0f0f] border border-white/10"
          >
            <h3 className="text-2xl mb-6">Add Whitelist Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={newWallet}
                  onChange={(e) => setNewWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nickname</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Enter a friendly name"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleAddWallet}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Add Address
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewWallet('');
                  setNewNickname('');
                }}
                className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 rounded-xl bg-[#0f0f0f] border border-white/10"
          >
            <h3 className="text-2xl mb-6">Edit Nickname</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                <div className="text-white font-mono text-sm bg-white/5 p-3 rounded-lg break-all">
                  {editingEntry.walletAddress}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nickname</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Enter nickname"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleUpdateWallet}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setNewNickname('');
                }}
                className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
