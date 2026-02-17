"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTokenPrice } from "@/utils/tokenPrice";

/**
 * Hook to batch fetch token prices for multiple addresses.
 * Deduplicates addresses and caches results.
 * 
 * @param tokenAddresses - Array of token contract addresses
 * @returns Object with priceMap (address -> price), isLoading, and error
 */
export function useTokenPrices(tokenAddresses: string[]) {
  // Get unique addresses only
  const uniqueAddresses = [...new Set(tokenAddresses.filter(Boolean))];
  
  const { data: priceMap, isLoading, error } = useQuery({
    queryKey: ["tokenPrices", uniqueAddresses.sort().join(",")],
    queryFn: async () => {
      if (uniqueAddresses.length === 0) return {};
      
      // Fetch all prices in parallel
      const pricePromises = uniqueAddresses.map(async (address) => {
        try {
          const price = await fetchTokenPrice(address);
          return { address, price };
        } catch (error) {
          console.error(`Error fetching price for ${address}:`, error);
          return { address, price: null };
        }
      });
      
      const results = await Promise.all(pricePromises);
      
      // Build price map
      const map: Record<string, number | null> = {};
      results.forEach(({ address, price }) => {
        map[address] = price;
      });
      
      return map;
    },
    // Prices are valid for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    enabled: uniqueAddresses.length > 0,
  });

  return {
    priceMap: priceMap || {},
    isLoading,
    error,
    getPrice: (address: string) => priceMap?.[address] ?? null,
  };
}

/**
 * Hook to fetch a single token price with caching.
 * Uses the same cache as useTokenPrices.
 * 
 * @param tokenAddress - Token contract address
 * @returns Object with price, isLoading, and error
 */
export function useTokenPrice(tokenAddress: string | undefined) {
  const { data: price, isLoading, error } = useQuery({
    queryKey: ["tokenPrice", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) return null;
      try {
        return await fetchTokenPrice(tokenAddress);
      } catch (error) {
        console.error(`Error fetching price for ${tokenAddress}:`, error);
        return null;
      }
    },
    // Prices are valid for 2 minutes
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!tokenAddress,
  });

  return { price: price ?? null, isLoading, error };
}
