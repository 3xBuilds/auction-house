"use server";

import BotCreateAuction from "@/components/BotCreateAuction";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; token?: string; minBid?: string; duration?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const auctionName = params.name || "Create Auction";
  const minBid = params.minBid || "0";
  const duration = params.duration || "24";
  const token = params.token || "";

  // Build the URL with params for the frame
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || "https://www.houseproto.fun";
  const miniAppUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://farcaster.xyz/miniapps/0d5aS3cWVprk/house";
  
  // URL for the mini app to open
  const frameUrl = `${miniAppUrl}/bot-create?name=${encodeURIComponent(auctionName)}&token=${encodeURIComponent(token)}&minBid=${encodeURIComponent(minBid)}&duration=${encodeURIComponent(duration)}`;
  
  const IMAGE = `${baseUrl}/pfp.jpg`;

  return {
    title: `Create: ${auctionName} | House`,
    description: `Create auction "${auctionName}" - Min bid: ${minBid}, Duration: ${duration}h`,
    
    // Farcaster frame metadata - same format as your other pages
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: IMAGE,
        button: {
          title: `Create: ${auctionName}`,
          action: {
            type: "launch_frame",
            name: "House",
            url: frameUrl,
            splashImageUrl: IMAGE,
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default async function BotCreatePage() {
  return <BotCreateAuction />;
}
