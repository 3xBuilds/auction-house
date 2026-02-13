'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface XPData {
  totalXP: number;
  currentSeasonXP: number;
  level: number;
  xpToNextLevel: number;
}

interface XPGain {
  amount: number;
  action: string;
  newLevel?: number;
  leveledUp?: boolean;
  metadata?: any;
}

interface XPContextValue {
  xpData: XPData | null;
  isLoading: boolean;
  refreshXP: () => Promise<void>;
  addXP: (gain: XPGain) => void;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, user } = usePrivy();
  const [xpData, setXPData] = useState<XPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch XP data from API
  const refreshXP = useCallback(async () => {
    if (!authenticated || !user) {
      setXPData(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/protected/xp/stats');
      
      if (response.ok) {
        const data = await response.json();
        setXPData({
          totalXP: data.totalXP || 0,
          currentSeasonXP: data.currentSeasonXP || 0,
          level: data.level || 1,
          xpToNextLevel: data.xpToNextLevel || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch XP data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, user]);

  // Optimistically update XP when earned
  const addXP = useCallback((gain: XPGain) => {
    setXPData(prev => {
      if (!prev) return null;

      const newTotalXP = prev.totalXP + gain.amount;
      const newSeasonXP = prev.currentSeasonXP + gain.amount;
      const newLevel = gain.newLevel || prev.level;
      
      // Recalculate XP to next level
      const nextLevelXP = (newLevel + 1) * (newLevel + 1) * 100;
      const xpToNextLevel = nextLevelXP - newTotalXP;

      return {
        totalXP: newTotalXP,
        currentSeasonXP: newSeasonXP,
        level: newLevel,
        xpToNextLevel: Math.max(0, xpToNextLevel),
      };
    });
  }, []);

  // Load XP on mount and when auth changes
  useEffect(() => {
    if (authenticated && user) {
      refreshXP();
    } else {
      setXPData(null);
    }
  }, [authenticated, user, refreshXP]);

  const value: XPContextValue = {
    xpData,
    isLoading,
    refreshXP,
    addXP,
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within XPProvider');
  }
  return context;
}
