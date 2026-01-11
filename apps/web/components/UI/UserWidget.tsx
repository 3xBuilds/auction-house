'use client';

import { User, FileText, Trophy, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useGlobalContext } from '@/utils/providers/globalContext';
import { useNavigateWithLoader } from '@/utils/useNavigateWithLoader';
import ProfileDrawer from './ProfileDrawer';

interface UserWidgetProps {
  isAuthenticated: boolean;
  onConnect: () => void;
}

export default function UserWidget({
  isAuthenticated,
  onConnect
}: UserWidgetProps) {
  const { user } = useGlobalContext();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const navigate = useNavigateWithLoader();

  const userMenuItems = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/my-auctions', label: 'My Auctions', icon: FileText },
    { path: '/won-bids', label: 'Won Bids', icon: Trophy },
  ];

  const handleMenuClick = (path: string) => {
    setUserDropdownOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Desktop User Widget - Bottom Left */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hidden md:block fixed left-6 bottom-6 z-40"
      >
        {isAuthenticated && user ? (
          <div className="relative">
            {/* Overlay to close dropdown */}
            <AnimatePresence>
              {userDropdownOpen && (
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setUserDropdownOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Animated Container that morphs */}
            <motion.div
              layout
              initial={false}
              animate={{
                width: userDropdownOpen ? 224 : 48,
                height: userDropdownOpen ? 300 : 48,
              }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400
              }}
              className="relative rounded-xl backdrop-blur-xl bg-[#0a0a0a]/60 border border-white/10 shadow-2xl overflow-hidden z-40"
            >
              {/* Collapsed State - Profile Button */}
              <AnimatePresence mode="wait">
                {!userDropdownOpen && (
                  <motion.button
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => setUserDropdownOpen(true)}
                    className="absolute inset-0 w-12 h-12 p-1 group"
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      {user.pfp_url ? (
                        <img
                          src={user.pfp_url}
                          alt={user.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl backdrop-blur-xl">
                      <span className="text-sm">{user.username || 'User'}</span>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-white/10"></div>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Expanded State - Menu */}
              <AnimatePresence mode="wait">
                {userDropdownOpen && (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: 0.15 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Profile Header with Image */}
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        {user.pfp_url ? (
                          <img
                            src={user.pfp_url}
                            alt={user.username || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.username || 'User'}</p>
                        <p className="text-xs text-white/40 mt-0.5 truncate">
                          {user.socialId ? `${user.socialId.slice(0, 8)}...` : 'Anonymous'}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 flex-1">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleMenuClick(item.path)}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-white/80 hover:text-white"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* View Full Profile Button */}
                    <div className="border-t border-white/5">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setProfileDrawerOpen(true);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-purple-400 hover:text-purple-300"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">View Stats</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          <button onClick={onConnect} className="relative group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl shadow-purple-500/50"
            >
              <User className="w-5 h-5 text-white" />
            </motion.div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl backdrop-blur-xl">
              <span className="text-sm">Connect Wallet</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-white/10"></div>
            </div>
          </button>
        )}
      </motion.div>

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
}
