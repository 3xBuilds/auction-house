'use client';

import { X, LogOut, User, TrendingUp, Award, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigateWithLoader } from '@/utils/useNavigateWithLoader';
import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useGlobalContext } from '@/utils/providers/globalContext';
import { toast } from 'sonner';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  auctionsCreated: number;
  auctionsWon: number;
  activeAuctions: number;
  totalVolume: number;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const navigate = useNavigateWithLoader();
  const { user } = useGlobalContext();
  const { logout, getAccessToken } = usePrivy();
  const [stats, setStats] = useState<UserStats>({
    auctionsCreated: 0,
    auctionsWon: 0,
    activeAuctions: 0,
    totalVolume: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.socialId || !isOpen) return;
      
      try {
        setLoading(true);
        const accessToken = await getAccessToken();
        const response = await fetch(`/api/users/profile?socialId=${user.socialId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            auctionsCreated: data.user?.hostedAuctions?.length || 0,
            auctionsWon: data.user?.bidsWon?.length || 0,
            activeAuctions: data.statistics?.activeAuctions || 0,
            totalVolume: data.statistics?.totalVolume || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.socialId, isOpen, getAccessToken]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Disconnected successfully');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to disconnect');
    }
  };

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!user) return null;

  const statItems = [
    { label: 'Auctions Created', value: stats.auctionsCreated, icon: Hammer },
    { label: 'Auctions Won', value: stats.auctionsWon, icon: Award },
    { label: 'Active Auctions', value: stats.activeAuctions, icon: TrendingUp },
    { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: User }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Profile</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex flex-col items-center mb-6">
                {user.pfp_url ? (
                  <img
                    src={user.pfp_url}
                    alt={user.username || 'User'}
                    className="w-24 h-24 rounded-2xl mb-4 border-2 border-white/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl mb-4 border-2 border-white/10 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h3 className="text-xl mb-1 font-semibold">{user.username || 'Anonymous'}</h3>
                {user.socialId && (
                  <p className="text-white/60 text-sm mb-2">
                    {user.platform === 'FARCASTER' ? `FID: ${user.socialId}` : `@${user.username}`}
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              {loading ? (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="text-sm text-white/60 mt-2">Loading stats...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {statItems.map((stat, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <stat.icon className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/60">{stat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Links */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="block w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left font-medium"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => handleNavigation('/my-auctions')}
                  className="block w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left font-medium"
                >
                  My Auctions
                </button>
                <button
                  onClick={() => handleNavigation('/won-bids')}
                  className="block w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left font-medium"
                >
                  Won Bids
                </button>
              </div>

              {/* Disconnect Button */}
              <button 
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}