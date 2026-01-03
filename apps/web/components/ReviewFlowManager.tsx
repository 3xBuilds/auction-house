'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useGlobalContext } from '@/utils/providers/globalContext';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/UI/Drawer';
import { Button } from '@/components/UI/button';
import ReviewForm from '@/components/ReviewForm';
import toast from 'react-hot-toast';

interface Auction {
  _id: string;
  auctionName: string;
  endDate: string;
  deliveredByHost: boolean;
  hasReview: boolean;
  winningBid?: {
    _id: string;
    username?: string;
    wallet?: string;
  };
}

const CUTOFF_DATE = new Date('2026-01-01T00:00:00Z');

const ReviewFlowManager: React.FC = () => {
  const { authenticated, getAccessToken } = usePrivy();
  const { user } = useGlobalContext();
  const { wallets } = useWallets();
  const address = wallets.length > 0 ? wallets[0].address : null;

  const [hostAuction, setHostAuction] = useState<Auction | null>(null);
  const [winnerAuction, setWinnerAuction] = useState<Auction | null>(null);
  const [isHostDrawerOpen, setIsHostDrawerOpen] = useState(false);
  const [isWinnerDrawerOpen, setIsWinnerDrawerOpen] = useState(false);
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated && user?.socialId && address) {
      fetchAuctions();
    } else {
      setLoading(false);
    }
  }, [authenticated, user?.socialId, address]);

  const fetchAuctions = async () => {
    try {
      const token = await getAccessToken();
      
      // Fetch hosted and won auctions in parallel
      const [hostedResponse, wonResponse] = await Promise.all([
        fetch(`/api/protected/auctions/my-auctions?id=${user?.socialId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/protected/auctions/won-bids?address=${address}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (hostedResponse.ok && wonResponse.ok) {
        const hostedData = await hostedResponse.json();
        const wonData = await wonResponse.json();

        // Filter hosted auctions for delivery confirmation
        const hostedToDeliver = hostedData.grouped?.ended?.find((auction: Auction) => {
          const endDate = new Date(auction.endDate);
          const auctionId = auction._id;
          const dismissed = localStorage.getItem(`host-drawer-dismissed-${auctionId}`);
          
          return (
            endDate > CUTOFF_DATE &&
            !auction.deliveredByHost &&
            !auction.hasReview &&
            !dismissed
          );
        });

        // Filter won auctions for review submission
        const wonToReview = wonData.auctions?.find((auction: Auction) => {
          const endDate = new Date(auction.endDate);
          const auctionId = auction._id;
          const dismissed = localStorage.getItem(`winner-drawer-dismissed-${auctionId}`);
          
          return (
            endDate > CUTOFF_DATE &&
            auction.deliveredByHost &&
            !auction.hasReview &&
            !dismissed
          );
        });

        // Show host drawer with priority
        if (hostedToDeliver) {
          setHostAuction(hostedToDeliver);
          setIsHostDrawerOpen(true);
        } else if (wonToReview) {
          setWinnerAuction(wonToReview);
          setIsWinnerDrawerOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching auctions for review flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!hostAuction) return;

    setIsMarkingDelivered(true);
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/protected/reviews/mark-delivered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ auctionId: hostAuction._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as delivered');
      }

      toast.success('Auction marked as delivered! The winner can now leave a review.');
      setIsHostDrawerOpen(false);
      setHostAuction(null);
      
      // Refresh to check for winner auctions
      fetchAuctions();
    } catch (error: any) {
      console.error('Error marking as delivered:', error);
      toast.error(error.message || 'Failed to mark as delivered');
    } finally {
      setIsMarkingDelivered(false);
    }
  };

  const handleHostDrawerDismiss = () => {
    if (hostAuction) {
      localStorage.setItem(`host-drawer-dismissed-${hostAuction._id}`, 'true');
    }
    setIsHostDrawerOpen(false);
    setHostAuction(null);
    
    // Check if there's a winner auction to show
    fetchAuctions();
  };

  const handleWinnerDrawerDismiss = () => {
    if (winnerAuction) {
      localStorage.setItem(`winner-drawer-dismissed-${winnerAuction._id}`, 'true');
    }
    setIsWinnerDrawerOpen(false);
    setWinnerAuction(null);
  };

  const handleReviewSuccess = () => {
    toast.success('Thank you for your review!');
    setIsWinnerDrawerOpen(false);
    setWinnerAuction(null);
  };

  if (loading || !authenticated) {
    return null;
  }

  return (
    <>
      {/* Host Delivery Drawer */}
      <Drawer open={isHostDrawerOpen} onOpenChange={setIsHostDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center gradient-text text-2xl">
              Auction Delivered?
            </DrawerTitle>
            <DrawerDescription className="text-center text-white/70">
              Confirm delivery to allow the winner to leave a review
            </DrawerDescription>
          </DrawerHeader>
          
          {hostAuction && (
            <div className="p-6 space-y-6">
              <div className="bg-black/40 backdrop-blur-md border border-primary/20 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-2">Auction</p>
                <p className="text-white font-semibold text-lg">{hostAuction.auctionName}</p>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-primary/20 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-2">Winner</p>
                <p className="text-white font-semibold">
                  {hostAuction.winningBid?.username || 
                   (hostAuction.winningBid?.wallet 
                     ? `${hostAuction.winningBid.wallet.slice(0, 6)}...${hostAuction.winningBid.wallet.slice(-4)}`
                     : 'Unknown')}
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-white/90 text-sm">
                  Reach out to the winner to deliver the auction item. Once delivered, 
                  mark it below to allow them to leave a review.
                </p>
              </div>
            </div>
          )}

          <DrawerFooter>
            <Button
              onClick={handleMarkAsDelivered}
              disabled={isMarkingDelivered}
              className="w-full"
            >
              {isMarkingDelivered ? 'Marking...' : 'Mark as Delivered'}
            </Button>
            <DrawerClose asChild>
              <Button 
                variant="outline" 
                onClick={handleHostDrawerDismiss}
                disabled={isMarkingDelivered}
              >
                Remind Me Later
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Winner Review Drawer */}
      <Drawer open={isWinnerDrawerOpen} onOpenChange={setIsWinnerDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center gradient-text text-2xl">
              Leave a Review
            </DrawerTitle>
            <DrawerDescription className="text-center text-white/70">
              Share your experience with this auction
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6">
            {winnerAuction && (
              <ReviewForm
                auctionId={winnerAuction._id}
                auctionName={winnerAuction.auctionName}
                onSuccess={handleReviewSuccess}
                onCancel={handleWinnerDrawerDismiss}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ReviewFlowManager;
