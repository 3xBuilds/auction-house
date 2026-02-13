'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { Sparkles, TrendingUp } from 'lucide-react';

interface XPToastProps {
  amount: number;
  action: string;
  leveledUp?: boolean;
  newLevel?: number;
}

export function showXPToast({ amount, action, leveledUp, newLevel }: XPToastProps) {
  const actionMessages: Record<string, string> = {
    CREATE_AUCTION: 'Created an auction',
    BID_PLACED: 'Placed a bid',
    WIN_AUCTION: 'Won an auction',
    LEAVE_REVIEW: 'Left a review',
    DAILY_LOGIN: 'Daily login',
  };

  const message = actionMessages[action] || 'Earned XP';

  if (leveledUp && newLevel) {
    // Level up toast - special styling
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">
                  🎉 Level Up!
                </p>
                <p className="mt-1 text-sm text-white">
                  You reached Level {newLevel}!
                </p>
                <p className="mt-1 text-xs text-purple-100">
                  +{amount} XP from {message.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-purple-400">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-purple-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  } else {
    // Regular XP toast
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  +{amount} XP
                </p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ),
      {
        duration: 3000,
        position: 'top-right',
      }
    );
  }
}

// Helper function to show XP gain from API response
export function handleXPGain(xpGain?: {
  amount: number;
  action: string;
  newLevel?: number;
  leveledUp?: boolean;
}) {
  if (!xpGain || !xpGain.amount) return;
  
  showXPToast({
    amount: xpGain.amount,
    action: xpGain.action,
    leveledUp: xpGain.leveledUp,
    newLevel: xpGain.newLevel,
  });
}
