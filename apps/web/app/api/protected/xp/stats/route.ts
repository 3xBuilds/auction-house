import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/utils/authService';
import { getUserXPStats } from '@/utils/xpService';
import User from '@/utils/schemas/User';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // @ts-ignore
    const socialId = req.headers.get('x-user-social-id');
    // @ts-ignore
    const privyId = req.headers.get('x-user-privy-id');

    if (!socialId && !privyId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    let user;
    if (privyId) {
      user = await User.findOne({ privyId });
    } else {
      user = await User.findOne({ socialId });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = await getUserXPStats(user._id);

    if (!stats) {
      return NextResponse.json({ error: 'Failed to fetch XP stats' }, { status: 500 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching XP stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
