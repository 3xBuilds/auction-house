"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface XPStats {
  level: number;
  currentSeasonXP: number;
  totalXP: number;
  xpToNextLevel: number;
}

interface UseXPStatsOptions {
  socialId: string | undefined;
  getAccessToken: () => Promise<string | null>;
  refreshCounter?: number;
  onSuccess?: (stats: XPStats) => void;
}

/**
 * Hook to fetch and cache XP stats for the current user.
 * Uses React Query to prevent refetching on every navigation.
 * 
 * @param options - Configuration options
 * @returns XP stats, loading state, and error
 */
export function useXPStats({ socialId, getAccessToken, refreshCounter = 0, onSuccess }: UseXPStatsOptions) {
  const queryClient = useQueryClient();

  // Invalidate query when refreshCounter changes (after XP is awarded)
  useEffect(() => {
    if (refreshCounter > 0) {
      queryClient.invalidateQueries({ queryKey: ["xpStats", socialId] });
    }
  }, [refreshCounter, socialId, queryClient]);

  const { data: xpStats, isLoading, error } = useQuery({
    queryKey: ["xpStats", socialId],
    queryFn: async () => {
      if (!socialId) return null;
      
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/leaderboard/user-stats`, {
        headers: {
          "x-user-social-id": socialId,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const stats: XPStats = {
          xpToNextLevel: data.stats.xpToNextLevel,
          level: data.stats.level,
          currentSeasonXP: data.stats.currentSeasonXP,
          totalXP: data.stats.totalXP
        };
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(stats);
        }
        
        return stats;
      }
      
      throw new Error("Failed to fetch XP stats");
    },
    // XP stats are valid for 60 seconds
    staleTime: 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    enabled: !!socialId,
    retry: 1,
  });

  return { xpStats: xpStats ?? null, isLoading, error };
}
