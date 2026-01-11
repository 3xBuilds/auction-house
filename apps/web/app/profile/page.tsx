'use client'

import { useGlobalContext } from '@/utils/providers/globalContext'
import { getAccessToken, usePrivy, useWallets } from '@privy-io/react-auth'
import Image from 'next/image'
import RatingCircle from '@/components/UI/RatingCircle'
import { Wallet, User, Hammer, Award, Calendar, Twitter, Shield, Star } from 'lucide-react'
import { useNavigateWithLoader } from '@/utils/useNavigateWithLoader'
import { useState, useEffect } from 'react'
import TwitterAuthModal from '@/components/UI/TwitterAuthModal'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import ReviewCard from '@/components/UI/ReviewCard'
import { LoadingSpinner } from '@/components/UI/LoadingSpinner'
import { EmptyState } from '@/components/UI/EmptyState'
import { motion } from 'framer-motion'

interface Review {
  _id: string
  rating: number
  comment?: string
  reviewer: {
    _id: string
    username?: string
    pfp_url?: string
    twitterProfile?: {
      username: string
      profileImageUrl?: string
    }
    wallets: string[]
  }
  auction: {
    _id: string
    auctionName: string
    blockchainAuctionId: string
  }
  createdAt: string
}

interface UserProfile {
  _id: string
  wallets: string[]
  username?: string
  socialId?: string
  socialPlatform?: string
  fid?: string
  pfp_url: string
  display_name: string
  averageRating?: number
  totalReviews?: number
  twitterProfile?: {
    id: string
    username: string
    name: string
    profileImageUrl?: string
  }
  hostedAuctions: string[]
  bidsWon: string[]
  participatedAuctions: string[]
  createdAt: string
}

interface ProfileStatistics {
  auctionsCreated: number
  auctionsWon: number
  totalBids: number
  totalVolume: number
  activeAuctions: number
}

export default function ProfilePage() {
  const { user } = useGlobalContext()
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const navigateWithLoader = useNavigateWithLoader()
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showTwitterModal, setShowTwitterModal] = useState(false)

  const {context} = useMiniKit()

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authenticated) {
        console.log('User not authenticated, skipping profile data fetch');
        return;
      }
      
      try {
        setLoading(true)
        const accessToken = await getAccessToken();
        console.log("Fetching profile data with user socialId", user.socialId);
        const response = await fetch('/api/users/profile?socialId=' + (user?.socialId),{
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        const data = await response.json()

        console.log('Profile data fetched:', data)

        if (data.success) {
          console.log('Profile data received:', data.user)
          setProfileData(data.user)
          setStatistics(data.statistics)
          
          // Fetch reviews
          const reviewsResponse = await fetch(`/api/reviews/user/${data.user._id}`)
          const reviewsData = await reviewsResponse.json()
          if (reviewsData.success) {
            setReviews(reviewsData.reviews)
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [authenticated, user])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="Please login to view your profile."
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`
    } else {
      return `$${volume.toFixed(2)}`
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Parallax Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-64 mb-8 rounded-3xl overflow-hidden"
        >
          {/* Animated gradient background */}
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute inset-0 bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.3),rgba(0,0,0,0.7))]" />
          
          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"
          />
          
          {/* Profile content */}
          <div className="relative h-full flex items-end p-8">
            <div className="flex items-end gap-6 w-full">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {user?.pfp_url ? (
                  <div className="relative">
                    <div className="absolute -inset-2 bg-white/20 rounded-3xl blur-xl" />
                    <Image
                      unoptimized
                      alt="Profile Picture"
                      src={profileData?.twitterProfile?.profileImageUrl || user.pfp_url}
                      width={140}
                      height={140}
                      className="relative w-32 h-32 border-4 border-white/30 rounded-3xl shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-4 border-white/30 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                    <Wallet className="text-6xl text-white" />
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 pb-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    {profileData?.twitterProfile?.username || user.username || 'Anonymous User'}
                  </h1>
                  {profileData?.averageRating && profileData.averageRating > 0 && (
                    <RatingCircle
                      rating={profileData.averageRating}
                      totalReviews={profileData.totalReviews || 0}
                      size="md"
                      showLabel={false}
                    />
                  )}
                </div>
                
                {!context && profileData?.twitterProfile?.id && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm font-medium">@{profileData.twitterProfile?.username}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards in Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Auctions Created', value: profileData?.hostedAuctions.length || 0, icon: Hammer, color: 'from-purple-500 to-pink-500' },
            { label: 'Auctions Won', value: profileData?.bidsWon.length || 0, icon: Award, color: 'from-yellow-500 to-orange-500' },
            { label: 'Total Reviews', value: profileData?.totalReviews || 0, icon: Star, color: 'from-blue-500 to-cyan-500' },
            { label: 'Member Since', value: profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A', icon: Calendar, color: 'from-green-500 to-emerald-500' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions with Floating Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { label: 'My Auctions', path: '/my-auctions', icon: Hammer, gradient: 'from-purple-500 to-pink-500', description: 'Manage your active listings' },
            { label: 'Won Auctions', path: '/won-bids', icon: Award, gradient: 'from-yellow-500 to-orange-500', description: 'View your winning bids' },
            { label: 'Create Auction', path: '/create', icon: User, gradient: 'from-green-500 to-emerald-500', description: 'Start a new auction' },
          ].map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateWithLoader(action.path)}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-white/60 text-sm">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Wallets Section */}
        {!context && profileData?.wallets && profileData.wallets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connected Wallets
            </h3>
            <div className="flex flex-wrap gap-3">
              {profileData.wallets.map((wallet, index) => (
                <motion.a
                  key={wallet}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.05 }}
                  href={`https://basescan.org/address/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/30 transition-all flex items-center gap-2 group"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-mono text-sm">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Section with Timeline Design */}
        {reviews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                Reviews
              </h2>
              <span className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm font-semibold">
                {reviews.filter(r => r.auction).length} Total
              </span>
            </div>
            
            <div className="space-y-4">
              {reviews.filter(review => review.auction).map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 + index * 0.05 }}
                >
                  <ReviewCard
                    rating={review.rating}
                    comment={review.comment}
                    reviewerId={review.reviewer._id}
                    reviewerName={
                      review.reviewer.twitterProfile?.username || 
                      review.reviewer.username || 
                      `${review.reviewer.wallets[0]?.slice(0, 6)}...${review.reviewer.wallets[0]?.slice(-4)}`
                    }
                    reviewerPfp={
                      review.reviewer.twitterProfile?.profileImageUrl ||
                      review.reviewer.pfp_url ||
                      null
                    }
                    auctionName={review.auction.auctionName}
                    createdAt={review.createdAt}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
                
        <TwitterAuthModal 
          isOpen={showTwitterModal}
          onClose={() => setShowTwitterModal(false)}
          onSuccess={() => {
            setShowTwitterModal(false);
            window.location.reload();
          }}
        />
      </div>
    </div>
  )
}