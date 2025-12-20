import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Auction from '@/utils/schemas/Auction';
import User from '@/utils/schemas/User';
import { authenticateRequest } from '@/utils/authService';

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  console.log('Authenticated user ID:', authResult);

  try {
    const body = await req.json();
    const { auctionId } = body;

    if (!auctionId) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Find the auction
    const auction = await Auction.findById(auctionId).populate('hostedBy');
    console.log('Fetched auction:', auction);
    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Verify the auction has ended
    if (auction.status !== 'ended') {
      return NextResponse.json({ error: 'Auction must be ended before marking as delivered' }, { status: 400 });
    }

    // Verify there is a winner
    if (!auction.winningBid || auction.winningBid === 'no_bids') {
      return NextResponse.json({ error: 'Cannot mark as delivered - no winner for this auction' }, { status: 400 });
    }

    // Check if already marked as delivered
    if (auction.deliveredByHost) {
      return NextResponse.json({ error: 'Auction already marked as delivered' }, { status: 400 });
    }

    // Mark as delivered
    auction.deliveredByHost = true;
    await auction.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Auction marked as delivered. The winner can now leave a review.',
      auction: {
        id: auction._id,
        auctionName: auction.auctionName,
        deliveredByHost: auction.deliveredByHost,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error marking auction as delivered:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
