'use client';

import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useGlobalContext } from '@/utils/providers/globalContext';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
}: NotificationModalProps) {
  const { context } = useMiniKit();
  const { user } = useGlobalContext();
  const { getAccessToken } = usePrivy();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      if (!user?.socialId) {
        setChecking(false);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const response = await fetch(`/api/users/profile?socialId=${user.socialId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotificationsEnabled(!!data.user?.notificationDetails?.token);
        }
      } catch (error) {
        console.error('Failed to check notification status:', error);
      } finally {
        setChecking(false);
      }
    };

    if (isOpen) {
      checkNotificationStatus();
    }
  }, [isOpen, user?.socialId, getAccessToken]);

  const handleEnable = async () => {
    if (!context) {
      toast.error('Notifications are only available in the Farcaster app');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/miniapp/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'notifications_enabled',
          notificationDetails: context.client,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled successfully!');
      } else {
        throw new Error(data.error || 'Failed to enable notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/miniapp/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'notifications_disabled',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotificationsEnabled(false);
        toast.success('Notifications disabled');
      } else {
        throw new Error(data.error || 'Failed to disable notifications');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="mx-4 p-6 rounded-2xl backdrop-blur-xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-green-400' : 'text-purple-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">Stay updated on your auctions</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checking ? (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <p className="text-sm text-white/60 mt-2">Checking status...</p>
                </div>
              ) : !context ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-yellow-400">
                      Notifications are only available when using the Farcaster app.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    Got it
                  </button>
                </div>
              ) : !notificationsEnabled ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    Get notified about important auction activity, bids, and wins.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                      <p className="text-white/80">When someone outbids you</p>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5" />
                      <p className="text-white/80">When auctions are ending soon</p>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-white/80">When you win an auction</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleEnable}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Enabling...' : 'Enable'}
                    </button>
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/60"
                    >
                      Later
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/60">
                    You're all set! We'll keep you updated on your auction activity.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisable}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm text-red-400 disabled:opacity-50"
                    >
                      {loading ? 'Disabling...' : 'Disable Notifications'}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
