import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  notificationsEnabled: boolean;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onEnable,
  notificationsEnabled
}: NotificationDrawerProps) {
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Notifications</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!notificationsEnabled ? (
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Bell className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-lg">Enable Notifications</h3>
                  <p className="text-gray-400 text-center text-sm">
                    Stay updated on your auctions, bids, and when you've been outbid. Never miss an important moment.
                  </p>
                  <div className="space-y-3 pt-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                      <div>
                        <p className="text-sm">Bid Notifications</p>
                        <p className="text-xs text-gray-400">Get notified when someone outbids you</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5" />
                      <div>
                        <p className="text-sm">Auction Updates</p>
                        <p className="text-xs text-gray-400">Stay informed about auction endings</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <div>
                        <p className="text-sm">Win Notifications</p>
                        <p className="text-xs text-gray-400">Celebrate when you win an auction</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onEnable}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all mt-6"
                  >
                    Enable Notifications
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-400"
                  >
                    Maybe Later
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Bell className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-lg">Notifications Enabled</h3>
                  <p className="text-gray-400 text-center text-sm">
                    You're all set! We'll keep you updated on your auction activity.
                  </p>
                  <div className="pt-4">
                    <div className="p-4 rounded-lg bg-white/5 text-center">
                      <p className="text-sm text-gray-400">No new notifications</p>
                    </div>
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
