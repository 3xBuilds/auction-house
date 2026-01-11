'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users, Award, Flame, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuctionCardProps {
  auction: {
    _id?: string;
    blockchainAuctionId: string;
    auctionName: string;
    status: string;
    minimumBid: number;
    highestBid: number;
    currency: string;
    participantCount: number;
    bidCount: number;
    timeInfo: string;
    imageUrl?: string;
    startingWallet?: string;
    hostedBy?: {
      pfp_url?: string;
      display_name?: string;
      username?: string;
    };
  };
  rank?: number;
  compact?: boolean;
  featured?: boolean;
  onSelect?: () => void;
  showActions?: boolean;
  actions?: React.ReactNode;
}

export function AuctionCard({ 
  auction, 
  rank, 
  compact = false,
  featured = false,
  onSelect, 
  showActions = false,
  actions 
}: AuctionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'from-green-500/90 to-emerald-500/90', border: 'border-green-500/50', glow: 'shadow-green-500/20' };
      case 'upcoming':
        return { bg: 'from-yellow-500/90 to-orange-500/90', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/20' };
      case 'ended':
        return { bg: 'from-gray-500/90 to-gray-600/90', border: 'border-gray-500/50', glow: 'shadow-gray-500/20' };
      default:
        return { bg: 'from-gray-500/90 to-gray-600/90', border: 'border-gray-500/50', glow: 'shadow-gray-500/20' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live Now';
      case 'upcoming':
        return 'Upcoming';
      case 'ended':
        return 'Ended';
      default:
        return status;
    }
  };

  const CardWrapper = onSelect ? 'div' : Link;
  const cardProps: any = onSelect 
    ? { onClick: onSelect, className: 'cursor-pointer' }
    : { href: `/bid/${auction.blockchainAuctionId}` };

  const statusColors = getStatusColor(auction.status);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <CardWrapper {...cardProps}>
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 bg-linear-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
            
            <div className="relative flex items-center gap-4">
              {rank !== undefined && (
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <span className="text-xl font-bold">#{rank}</span>
                </motion.div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate mb-1 group-hover:text-purple-300 transition-colors">
                  {auction.auctionName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium text-white">{auction.highestBid}</span> {auction.currency}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {auction.participantCount}
                  </span>
                </div>
              </div>

              <div className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium text-white border backdrop-blur-sm shadow-lg',
                `bg-linear-to-r ${statusColors.bg} ${statusColors.border} ${statusColors.glow}`
              )}>
                {getStatusText(auction.status)}
              </div>
            </div>
          </div>
        </CardWrapper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, type: "spring", damping: 20 }}
      className={cn("group h-full", featured && "lg:col-span-2 lg:row-span-2")}
    >
      <CardWrapper {...cardProps}>
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 h-full flex flex-col shadow-xl hover:shadow-2xl hover:shadow-purple-500/10">
          
          {/* Gradient glow overlay */}
          <div className="absolute -inset-[1px] bg-linear-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-pink-500/20 group-hover:to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

          {/* Image Section with Overlay */}
          <div className={cn(
            "relative overflow-hidden bg-linear-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20",
            featured ? "h-80" : "h-56"
          )}>
            {auction.imageUrl ? (
              <motion.div className="w-full h-full">
                <img 
                  src={auction.imageUrl} 
                  alt={auction.auctionName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center backdrop-blur-sm">
                <Award className="w-20 h-20 text-white/10" />
              </div>
            )}
            
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Status Badge - Top Right */}
            <motion.div 
              initial={{ x: 100 }}
              animate={{ x: 0 }}
              className="absolute top-4 right-4"
            >
              <div className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold text-white border backdrop-blur-xl shadow-2xl flex items-center gap-2',
                `bg-linear-to-r ${statusColors.bg} ${statusColors.border} ${statusColors.glow}`
              )}>
                {auction.status === 'active' && <Zap className="w-4 h-4" />}
                {getStatusText(auction.status)}
              </div>
            </motion.div>

            {/* Rank Badge - Top Left */}
            {rank !== undefined && (
              <motion.div 
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="absolute top-4 left-4"
              >
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-2xl shadow-purple-500/40 border border-white/20">
                  #{rank}
                </div>
              </motion.div>
            )}

            {/* Floating Bid Info Badge - Bottom Left */}
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Current Bid</p>
                    <p className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      {auction.highestBid} {auction.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-1">Participants</p>
                    <p className="text-lg font-semibold flex items-center gap-1 justify-end">
                      <Users className="w-4 h-4 text-purple-400" />
                      {auction.participantCount}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Host Profile - Floating Avatar */}
            {auction.hostedBy?.pfp_url && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden backdrop-blur-sm shadow-lg">
                    <img 
                      src={auction.hostedBy.pfp_url} 
                      alt={auction.hostedBy.display_name || auction.hostedBy.username || 'Host'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className={cn(
              "font-bold mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors",
              featured ? "text-2xl" : "text-lg"
            )}>
              {auction.auctionName}
            </h3>

            <div className="space-y-3 mb-4 flex-1">
              <div className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3 border border-white/10">
                <span className="text-white/60">Minimum Bid</span>
                <span className="font-semibold text-white">{auction.minimumBid} {auction.currency}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {auction.timeInfo}
                </span>
                <span>
                  {auction.bidCount} bids
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && actions && (
              <div className="mt-auto pt-4 border-t border-white/10">
                {actions}
              </div>
            )}
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
}
