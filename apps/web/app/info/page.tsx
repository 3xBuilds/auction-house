'use client'

import { HelpCircle, Rocket, Award, Shield, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InfoPage() {
  const faqs = [
    {
      icon: Rocket,
      title: 'How to Start as a Creator',
      content: 'Connect your wallet, link your Twitter account for verification, and create your first auction. Set your terms including currency, minimum bid, and auction duration. Share your auction with your community and watch the bids roll in.'
    },
    {
      icon: Award,
      title: 'What Makes HOUSE Different',
      content: 'HOUSE is built on transparency and community. All bids are on-chain, ensuring fairness. Our reward system gives back to active participants. Plus, with flexible currency options and easy-to-use interface, anyone can participate.'
    },
    {
      icon: Users,
      title: 'For Bidders & Brands',
      content: 'Browse active auctions, place competitive bids, and win exclusive digital assets. Track your bidding activity, claim your winnings, and earn rewards for participation. The more you engage, the more you earn.'
    },
    {
      icon: DollarSign,
      title: 'Settlement & Payments',
      content: 'When an auction ends, the highest bidder wins. Creators can claim their revenue, and winners can claim their prizes. All transactions are secure and processed on the Base chain for fast, low-cost settlements.'
    },
    {
      icon: Shield,
      title: 'What Happens When Auction Ends',
      content: 'The auction creator can end the auction manually or it ends automatically at the set time. The highest bidder is declared the winner. Funds are distributed, and both parties can claim their respective rewards through the platform.'
    },
    {
      icon: HelpCircle,
      title: 'Weekly Rewards Program',
      content: 'Earn 1% cashback on all your bidding activity each week. The more you participate, the more you earn. Track your weekly stats and claim your rewards every Monday. Top bidders also appear on our leaderboard.'
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6"
          >
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl mb-4"
          >
            How HOUSE Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to know about creating auctions, bidding, and earning rewards on the platform
          </motion.p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <faq.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-3">{faq.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Getting Started Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-8 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        >
          <h2 className="text-2xl mb-6 text-center">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-black">
                1
              </div>
              <h4 className="mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-400">Link your crypto wallet to get started</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-black">
                2
              </div>
              <h4 className="mb-2">Browse or Create</h4>
              <p className="text-sm text-gray-400">Explore auctions or create your own</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-black">
                3
              </div>
              <h4 className="mb-2">Participate</h4>
              <p className="text-sm text-gray-400">Place bids or manage your auctions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-black">
                4
              </div>
              <h4 className="mb-2">Earn & Claim</h4>
              <p className="text-sm text-gray-400">Win auctions and claim rewards</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl mb-4">Still Have Questions?</h2>
          <p className="text-gray-400 mb-6">
            Join our community or reach out to our team for support
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all">
              Join Discord
            </button>
            <button className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

