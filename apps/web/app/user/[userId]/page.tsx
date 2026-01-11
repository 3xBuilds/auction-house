"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Star } from "lucide-react";
import UserAuctions from "@/components/UserAuctions";
import ReviewCard from "@/components/UI/ReviewCard";
import RatingCircle from "@/components/UI/RatingCircle";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import EmptyState from "@/components/UI/EmptyState";
import { motion } from "framer-motion";
import Image from "next/image";
import { RiTwitterXLine } from "react-icons/ri";

interface UserData {
  user: {
    _id: string;
    wallet: string;
    fid?: string;
    username?: string;
    pfp_url?: string | null;
    display_name?: string | null;
    bio?: string | null;
    x_username?: string | null;
    averageRating?: number;
    totalReviews?: number;
    twitterProfile?: any | null;
    platform?: string | null;
  };
  activeAuctions: any[];
  endedAuctions: any[];
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    _id: string;
    username?: string;
    display_name?: string;
    pfp_url?: string | null;
    twitterProfile?: {
      username: string;
      profileImageUrl?: string;
    };
  };
  auction: {
    auctionName: string;
  };
}

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "active" | "ended">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const { context } = useMiniKit();

  const handleViewProfile = async () => {
    if (context && userData?.user.fid) {
      try {
        await sdk.actions.viewProfile({
          fid: parseInt(userData.user.fid),
        });
      } catch (error) {
        console.error("Error viewing profile:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/auctions`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId || activeTab !== "reviews") return;
      
      try {
        setReviewsLoading(true);
        const response = await fetch(`/api/reviews/user/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [userId, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={User}
          title="No User Data"
          description="User profile not found"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-all mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </motion.button>

        {/* Parallax Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-80 mb-8 rounded-3xl overflow-hidden"
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
          
          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"
          />
          
          {/* Profile content */}
          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="flex max-lg:flex-col items-end lg:items-center gap-6">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {userData.user.pfp_url ? (
                  <div className="relative">
                    <div className="absolute -inset-3 bg-white/20 rounded-3xl blur-2xl" />
                    <Image
                      unoptimized
                      src={userData.user.pfp_url}
                      alt={userData.user.username || 'User'}
                      width={160}
                      height={160}
                      className="relative w-40 h-40 rounded-3xl border-4 border-white/30 shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-3xl border-4 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                    <User className="w-20 h-20 text-white" />
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 max-lg:text-center pb-2"
              >
                <div className="flex items-center gap-3 max-lg:justify-center mb-3">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                    {userData.user.display_name || (userData.user.username ? `@${userData.user.username}` : 'User Profile')}
                  </h1>
                  {(userData.user.averageRating ?? 0) > 0 && (userData.user.totalReviews ?? 0) > 0 && (
                    <RatingCircle
                      rating={userData.user.averageRating}
                      totalReviews={userData.user.totalReviews}
                      size="lg"
                      showLabel={false}
                    />
                  )}
                </div>

                {userData.user.bio && (
                  <p className="text-white/90 text-lg mb-4 max-lg:text-center max-w-2xl">
                    {userData.user.bio}
                  </p>
                )}

                <div className="flex gap-3 max-lg:justify-center flex-wrap">
                  {userData.user.x_username && userData.user.platform == "FARCASTER" && (
                    <motion.a
                      whileHover={{ scale: 1.05, y: -2 }}
                      href={`https://x.com/${userData.user.x_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all text-sm font-medium shadow-lg"
                    >
                      <RiTwitterXLine className="w-4 h-4" />
                      @{userData.user.x_username}
                    </motion.a>
                  )}

                  {userData.user.twitterProfile && userData.user.platform == "TWITTER" && (
                    <motion.a
                      whileHover={{ scale: 1.05, y: -2 }}
                      href={`https://x.com/${userData.user.twitterProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all text-sm font-medium shadow-lg"
                    >
                      <RiTwitterXLine className="w-4 h-4" />
                      @{userData.user.twitterProfile.username}
                    </motion.a>
                  )}

                  {context && userData.user.fid && userData.user.platform == "FARCASTER" && (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleViewProfile}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-white backdrop-blur-sm text-purple-600 rounded-xl hover:bg-white/90 transition-all text-sm font-semibold shadow-lg"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-2">
                {userData.activeAuctions.length + userData.endedAuctions.length}
              </div>
              <div className="text-white/60">Total Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400 mb-2">
                {userData.activeAuctions.length}
              </div>
              <div className="text-white/60">Active Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-400 mb-2">
                {userData.user.totalReviews || 0}
              </div>
              <div className="text-white/60">Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* Animated Tab Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2"
        >
          {[
            { key: 'reviews', label: 'Reviews', count: reviews.length },
            { key: 'active', label: 'Active', count: userData.activeAuctions.length },
            { key: 'ended', label: 'Ended', count: userData.endedAuctions.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`relative flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {tab.label}
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === "reviews" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {reviewsLoading ? (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center border border-white/10">
                <LoadingSpinner size="md" text="Loading reviews..." />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10">
                <EmptyState
                  icon={Star}
                  title="No Reviews Yet"
                  description="This user hasn't received any reviews"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    User Reviews
                  </h2>
                  <span className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm font-semibold">
                    {reviews.length} Total
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reviews.filter(review => review.auction).map((review, index) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <ReviewCard
                        rating={review.rating}
                        comment={review.comment}
                        reviewerId={review.reviewer._id}
                        reviewerName={
                          review.reviewer.display_name ||
                          (review.reviewer.username ? `@${review.reviewer.username}` : "Anonymous")
                        }
                        reviewerPfp={review.reviewer.twitterProfile?.profileImageUrl ||
                        review.reviewer.pfp_url ||
                        null}
                        auctionName={review.auction.auctionName}
                        createdAt={review.createdAt}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "active" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UserAuctions
              activeAuctions={userData.activeAuctions}
              endedAuctions={[]}
            />
          </motion.div>
        )}

        {activeTab === "ended" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UserAuctions
              activeAuctions={[]}
              endedAuctions={userData.endedAuctions}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
