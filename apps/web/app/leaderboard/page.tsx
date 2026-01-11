'use client'

import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface TopRevenueUser {
  _id: string;
  totalRevenue: number;
  auctionCount: number;
  wallet: string;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  twitterProfile?: {
    username: string;
    name: string;
    profileImageUrl?: string;
  };
}

interface HighestBid {
  _id: string;
  auctionId: string;
  bidAmount: number;
  usdcValue?: number;
  bidTimestamp: string;
  userId: string;
  wallet: string;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  twitterProfile?: {
    username: string;
    name: string;
    profileImageUrl?: string;
  };
  auctionName: string;
  currency: string;
}

export default function LeaderboardPage() {
  const [topRevenue, setTopRevenue] = useState<TopRevenueUser[]>([]);
  const [highestBids, setHighestBids] = useState<HighestBid[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingBids, setLoadingBids] = useState(true);
  const [activeTab, setActiveTab] = useState<'revenue' | 'bids'>('revenue');
  const router = useRouter();

  useEffect(() => {
    const fetchTopRevenue = async () => {
      try {
        const response = await fetch('/api/leaderboard/top-revenue');
        const result = await response.json();
        if (result.success) {
          setTopRevenue(result.data);
        }
      } catch (error) {
        console.error('Error fetching top revenue:', error);
      } finally {
        setLoadingRevenue(false);
      }
    };

    const fetchHighestBids = async () => {
      try {
        const response = await fetch('/api/leaderboard/highest-bids');
        const result = await response.json();
        if (result.success) {
          setHighestBids(result.data);
        }
      } catch (error) {
        console.error('Error fetching highest bids:', error);
      } finally {
        setLoadingBids(false);
      }
    };

    fetchTopRevenue();
    fetchHighestBids();
  }, []);

  const formatWallet = (wallet: string) => {
    if (!wallet) return 'N/A';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const loading = activeTab === 'revenue' ? loadingRevenue : loadingBids;
  const data = activeTab === 'revenue' ? topRevenue : highestBids;

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top performers in the HOUSE community</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'revenue'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Top Revenue</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              activeTab === 'bids'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Highest Bids</span>
            </div>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-gray-400">No data available yet</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Top Revenue */}
            {activeTab === 'revenue' && topRevenue.map((entry, index) => {
              const rankIndex = index + 1;
              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => router.push(`/user/${entry._id}`)}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    rankIndex === 1
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                      : rankIndex === 2
                      ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30'
                      : rankIndex === 3
                      ? 'bg-gradient-to-r from-orange-700/10 to-orange-800/10 border-orange-700/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          rankIndex === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black'
                            : rankIndex === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                            : rankIndex === 3
                            ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        #{rankIndex}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <img
                          src={entry.pfp_url || '/default-avatar.png'}
                          alt={entry.display_name || entry.username || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-white/10"
                        />
                        <div>
                          <p className="text-lg">{entry.display_name || entry.username || formatWallet(entry.wallet)}</p>
                          {entry.username && entry.display_name && (
                            <p className="text-sm text-gray-400">@{entry.username}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-2xl mb-1">${formatNumber(entry.totalRevenue)}</p>
                      <p className="text-sm text-gray-400">{entry.auctionCount} auctions</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Highest Bids */}
            {activeTab === 'bids' && highestBids.map((entry, index) => {
              const rankIndex = index + 1;
              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => router.push(`/user/${entry.userId}`)}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    rankIndex === 1
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                      : rankIndex === 2
                      ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30'
                      : rankIndex === 3
                      ? 'bg-gradient-to-r from-orange-700/10 to-orange-800/10 border-orange-700/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                          rankIndex === 1
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black'
                            : rankIndex === 2
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                            : rankIndex === 3
                            ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        #{rankIndex}
                      </div>

                      {/* Bidder Info */}
                      <div className="flex items-center space-x-3">
                        <img
                          src={entry.pfp_url || '/default-avatar.png'}
                          alt={entry.display_name || entry.username || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-white/10"
                        />
                        <div>
                          <p className="text-lg">{entry.display_name || entry.username || formatWallet(entry.wallet)}</p>
                          <p className="text-sm text-gray-400 mb-1">
                            {entry.username && entry.display_name ? `@${entry.username}` : ''}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">{entry.auctionName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bid Amount */}
                    <div className="text-right">
                      <p className="text-2xl mb-1">${entry.usdcValue ? formatNumber(entry.usdcValue) : formatNumber(entry.bidAmount)}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(entry.bidTimestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

