'use client'

import { useEffect, useState } from "react"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { DollarSign, TrendingUp, Award, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeeklyReward {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  totalSpentUSD: number;
  bidCount: number;
  claimed: boolean;
  rewardAmount: number;
}

interface WeeklyBidder {
  _id: string;
  userId: string;
  wallet: string;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  totalSpentUSD: number;
  bidCount: number;
  weekStartDate: string;
  weekEndDate: string;
}

export default function EarnPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets.length > 0 ? wallets[0].address : null;
  const [weeklyRewards, setWeeklyRewards] = useState<WeeklyReward[]>([]);
  const [weeklyBidders, setWeeklyBidders] = useState<WeeklyBidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && address) {
      fetchWeeklyRewards();
      fetchWeeklyBidders();
    } else {
      setLoading(false);
      setLoadingLeaderboard(false);
    }
  }, [authenticated, address]);

  const fetchWeeklyRewards = async () => {
    try {
      const response = await fetch('/api/earn/weekly-rewards', {
        headers: {
          'x-user-wallet': address || ''
        }
      });
      const result = await response.json();
      if (result.success) {
        setWeeklyRewards(result.data);
      }
    } catch (error) {
      console.error('Error fetching weekly rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyBidders = async () => {
    try {
      const response = await fetch('/api/leaderboard/weekly-bidders');
      const result = await response.json();
      if (result.success) {
        setWeeklyBidders(result.data);
      }
    } catch (error) {
      console.error('Error fetching weekly bidders:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleClaim = async (entryId: string) => {
    setClaiming(entryId);
    try {
      const response = await fetch('/api/earn/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-wallet': address || ''
        },
        body: JSON.stringify({ entryId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the local state
        setWeeklyRewards(prev =>
          prev.map(reward =>
            reward._id === entryId
              ? { ...reward, claimed: true, rewardAmount: result.rewardAmount }
              : reward
          )
        );
        alert(`Successfully claimed $${result.rewardAmount} reward!`);
      } else {
        alert(`Failed to claim reward: ${result.error}`);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatWallet = (wallet: string) => {
    if (!wallet) return 'N/A';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const isWeekEnded = (weekEndDate: string) => {
    return new Date() > new Date(weekEndDate);
  };

  const unclaimedRewards = weeklyRewards.filter(r => !r.claimed && isWeekEnded(r.weekEndDate));
  const claimedRewards = weeklyRewards.filter(r => r.claimed);
  const currentWeekRewards = weeklyRewards.filter(r => !isWeekEnded(r.weekEndDate));

  const totalEarned = claimedRewards.reduce((sum, w) => sum + w.rewardAmount, 0);
  const totalPending = unclaimedRewards.reduce((sum, w) => sum + w.rewardAmount, 0);

  if (!authenticated || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to view your earnings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Earn Rewards</h1>
          <p className="text-gray-400">Get rewarded for participating in auctions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earned</p>
                <p className="text-2xl">${formatNumber(totalEarned)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending Rewards</p>
                <p className="text-2xl">${formatNumber(totalPending)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Weeks Participated</p>
                <p className="text-2xl">{weeklyRewards.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How it Works */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-12">
          <h2 className="text-2xl mb-4">How Earning Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400">1</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Participate in Auctions</h3>
                <p className="text-sm text-gray-400">
                  Place bids on auctions throughout the week to earn points
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400">2</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Weekly Rewards</h3>
                <p className="text-sm text-gray-400">
                  Earn 1% of your total spending each week as rewards
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-400">3</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Claim Rewards</h3>
                <p className="text-sm text-gray-400">
                  Claim your rewards at the end of each week
                </p>
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Weekly Rewards */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Your Weekly Rewards</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : weeklyRewards.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-gray-400">No rewards yet. Start bidding to earn!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unclaimed Rewards */}
              {unclaimedRewards.map((week, index) => (
                <motion.div
                  key={week._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 rounded-xl bg-white/5 border border-purple-500/50 hover:border-purple-500 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg">
                          {week.weekLabel} - Week of {new Date(week.weekStartDate).toLocaleDateString()} - {new Date(week.weekEndDate).toLocaleDateString()}
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Total Spent</p>
                          <p className="">${formatNumber(week.totalSpentUSD)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Bids Placed</p>
                          <p className="">{week.bidCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Reward</p>
                          <p className="text-green-400">${formatNumber(week.rewardAmount)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleClaim(week._id)}
                        disabled={claiming === week._id}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center space-x-2"
                      >
                        {claiming === week._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Claiming...</span>
                          </>
                        ) : (
                          <span>Claim ${formatNumber(week.rewardAmount)}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Current Week Progress */}
              {currentWeekRewards.map((week, index) => (
                <motion.div
                  key={week._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (unclaimedRewards.length + index) * 0.05 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg">
                          {week.weekLabel} - Week of {new Date(week.weekStartDate).toLocaleDateString()} - {new Date(week.weekEndDate).toLocaleDateString()}
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Total Spent</p>
                          <p className="">${formatNumber(week.totalSpentUSD)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Bids Placed</p>
                          <p className="">{week.bidCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Reward</p>
                          <p className="text-green-400">${formatNumber(week.rewardAmount)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="px-6 py-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        In Progress
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Claimed Rewards */}
              {claimedRewards.map((week, index) => (
                <motion.div
                  key={week._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (unclaimedRewards.length + currentWeekRewards.length + index) * 0.05 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all opacity-75"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg">
                          {week.weekLabel} - Week of {new Date(week.weekStartDate).toLocaleDateString()} - {new Date(week.weekEndDate).toLocaleDateString()}
                        </h3>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Total Spent</p>
                          <p className="">${formatNumber(week.totalSpentUSD)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Bids Placed</p>
                          <p className="">{week.bidCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">Reward</p>
                          <p className="text-green-400">${formatNumber(week.rewardAmount)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="px-6 py-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                        Claimed
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Leaderboard */}
        <div>
          <h2 className="text-2xl mb-6">Weekly Top Bidders</h2>
          <h2 className="text-2xl mb-6">Weekly Top Bidders</h2>
          {loadingLeaderboard ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : weeklyBidders.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-gray-400">No qualifying bids this week (minimum $10 USD)</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">Rank</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-400">User</th>
                      <th className="px-6 py-4 text-right text-sm text-gray-400">Total Spent</th>
                      <th className="px-6 py-4 text-right text-sm text-gray-400">Bids</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {weeklyBidders.map((bidder, index) => (
                      <tr key={bidder._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="text-gray-400 font-medium">#{index + 1}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {bidder.pfp_url && (
                              <img
                                src={bidder.pfp_url}
                                alt={bidder.display_name || bidder.username || 'User'}
                                className="w-10 h-10 rounded-full border-2 border-white/10"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {bidder.display_name || bidder.username || formatWallet(bidder.wallet)}
                              </div>
                              {bidder.username && bidder.display_name && (
                                <div className="text-xs text-gray-400">@{bidder.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-purple-400">${formatNumber(bidder.totalSpentUSD)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-400">{bidder.bidCount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

