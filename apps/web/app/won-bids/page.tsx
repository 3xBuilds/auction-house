'use client'

import { useEffect, useState } from "react"
import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@/components/UI/button";
import { Trophy, Package } from "lucide-react";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import { useGlobalContext } from "@/utils/providers/globalContext";
import Image from "next/image";
import { AuctionCard } from "@/components/UI/AuctionCard";
import  EmptyState from "@/components/UI/EmptyState";
import  LoadingSpinner from "@/components/UI/LoadingSpinner";
import { motion } from "framer-motion";

interface Auction {
  _id: string;
  auctionName: string;
  endDate: string;
  startDate: string;
  currency: string;
  minimumBid: number;
  blockchainAuctionId: string;
  tokenAddress: string;
  startingWallet: string;
  hostedBy: {
    _id: string;
    username?: string;
    display_name?: string;
    pfp_url?: string;
  };
  highestBid: number;
  participantCount: number;
  bidCount: number;
  timeInfo: string;
}

interface WonBidsResponse {
  success: boolean;
  auctions: Auction[];
  total: number;
}

interface WonAuction extends Auction {}

export default function WonBidsPage() {
  const { authenticated } = usePrivy();
  const {user} = useGlobalContext();
  const [auctions, setAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigateWithLoader();
  const { getAccessToken } = usePrivy();

  const fetchWonBids = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/protected/auctions/won-bids?socialId=${user.socialId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WonBidsResponse = await response.json();

      if (data.success) {
        setAuctions(data.auctions);
      } else {
        throw new Error("Failed to fetch won auctions");
      }
    } catch (err) {
      console.error("Error fetching won auctions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch won auctions");
    } finally {
      setLoading(false);
    }
  };

  const viewAuction = (blockchainAuctionId: string) => {
    navigate(`/bid/${blockchainAuctionId}`);
  };

  useEffect(() => {
    if (authenticated && user) {
      fetchWonBids();
    } else {
      setLoading(false);
    }
  }, [authenticated, user]);

  if (!authenticated || !user) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Won Auctions</h1>
        <EmptyState
          icon={Package}
          title="Authentication Required"
          description="Please connect your wallet to view your won auctions."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your won auctions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Won Auctions</h1>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchWonBids} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Won Auctions</h1>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Won Auctions Yet"
          description="You haven't won any auctions yet. Keep bidding to claim your first victory!"
          action={
            <Button 
              onClick={() => navigate('/')}
              className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Browse Live Auctions
            </Button>
          }
        />
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {auctions.map((auction, index) => (
              <motion.div
                key={auction._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="relative"
              >
                {/* Winner Badge */}
                <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>

                <AuctionCard
                  auction={{
                    ...auction,
                    status: 'ended',
                    timeInfo: `Ended ${new Date(auction.endDate).toLocaleDateString()}`
                  }}
                  showActions={true}
                  actions={
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <div className="flex-1">
                          <p className="text-xs text-white/60">Winning Bid</p>
                          <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                            {auction.highestBid} {auction.currency}
                          </p>
                        </div>
                      </div>

                      {auction.hostedBy && (
                        <div 
                          onClick={() => navigate(`/user/${auction.hostedBy._id}`)}
                          className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {auction.hostedBy.pfp_url && (
                            <Image 
                              unoptimized 
                              src={auction.hostedBy.pfp_url} 
                              alt={auction.hostedBy.username || 'Host'} 
                              width={32} 
                              height={32} 
                              className="w-8 h-8 rounded-full border border-white/20" 
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/60">Hosted by</p>
                            <p className="text-sm font-medium truncate">
                              {auction.hostedBy.username || `${auction.startingWallet.slice(0, 6)}...${auction.startingWallet.slice(-4)}`}
                            </p>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => viewAuction(auction.blockchainAuctionId)}
                        variant="outline"
                        className="w-full"
                      >
                        View Details
                      </Button>

                      <p className="text-center text-xs text-white/60">
                        🎉 Congratulations on your victory!
                      </p>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-white/60">
              Total victories: <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg">{auctions.length}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}