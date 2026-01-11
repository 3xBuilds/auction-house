"use client";

import { useEffect, useState } from "react";
import { Button } from "./UI/button";
import { cn } from "@/lib/utils";
import { Loader2, Hammer, Eye, Package } from "lucide-react";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import {
  auctionAbi,
  contractAdds,
  erc20Abi,
  readContractSetup,
  writeNewContractSetup,
} from "@repo/contracts";
import toast from "react-hot-toast";
import { useSendCalls } from "wagmi";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { encodeFunctionData, numberToHex } from "viem";
import { base as baseChain } from "viem/chains";
import { useGlobalContext } from "@/utils/providers/globalContext";
import {
  base,
  createBaseAccountSDK,
  getCryptoKeyAccount,
} from "@base-org/account";
import { checkStatus } from "@/utils/checkStatus";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from "ethers";
import { AuctionCard } from "./UI/AuctionCard";
import { EmptyState } from "./UI/EmptyState";
import { LoadingSpinner } from "./UI/LoadingSpinner";
import { motion } from "framer-motion";

interface Bidder {
  user: string;
  bidAmount: number;
  bidTimestamp: string;
}

interface Auction {
  _id: string;
  auctionName: string;
  endDate: string;
  startDate: string;
  bidders: Bidder[];
  currency: string;
  minimumBid: number;
  blockchainAuctionId: string;
  tokenAddress: string;
  startingWallet: string;
  hostedBy: {
    _id: string;
    wallet: string;
    username?: string;
  };
  highestBid: number;
  participantCount: number;
  bidCount: number;
  status: "active" | "upcoming" | "ended";
  timeInfo: string;
}

interface AuctionsResponse {
  success: boolean;
  auctions: Auction[];
  grouped: {
    active: Auction[];
    upcoming: Auction[];
    ended: Auction[];
  };
  total: number;
  counts: {
    active: number;
    upcoming: number;
    ended: number;
  };
}

export default function MyAuctionCards() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [endingAuction, setEndingAuction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "ended">(
    "active"
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEndingAuction, setCurrentEndingAuction] = useState<{auctionId: string, bidders: any[]} | null>(null);

  const navigate = useNavigateWithLoader();
  const { sendCalls, isSuccess, status: txStatus } = useSendCalls();
  const { context } = useMiniKit();
  const {wallets} = useWallets();
  const externalWallets = wallets.filter(
    wallet => wallet.walletClientType !== 'privy'
  );
  
  const address = externalWallets.length > 0 ? externalWallets[0].address : null;

  const { user } = useGlobalContext();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    // When transaction succeeds
    if (isSuccess && currentEndingAuction) {
      if (loadingToastId) {
        toast.success("Transaction successful! Ending auction...", {
          id: loadingToastId,
        });
      }
      processEndAuctionSuccess(currentEndingAuction.auctionId, currentEndingAuction.bidders);
      setCurrentEndingAuction(null);
    }
    // When transaction fails (status === 'error')
    else if (txStatus === "error") {
      if (loadingToastId) {
        toast.error("Transaction failed. Please try again.", {
          id: loadingToastId,
        });
      }
      setIsLoading(false);
      setEndingAuction(null);
      setCurrentEndingAuction(null);
      console.error("Transaction failed");
    }
  }, [isSuccess, txStatus]);

  const processEndAuctionSuccess = async (auctionId: string, bidders: any[]) => {
    try {
      // Call the API to end the auction with bidders data
       toast.loading("Transaction confirmed! Ending auction...");
      const accessToken = await getAccessToken();

      console.log("Ending auction via API:", auctionId, bidders);
      const response = await fetch(
        `/api/protected/auctions/${auctionId}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "x-user-wallet": user.socialId
          },
          body: JSON.stringify({
            bidders: bidders,
          }),
        }
      );

      console.log("API response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to end auction");
      }

      const data = await response.json();

      // Fee distribution will be handled server-side by the auction end API
      // This ensures it runs regardless of client connection status
      console.log('✅ Auction ended successfully, fee distribution initiated server-side');
      
      if (loadingToastId) {
        toast.success("Auction ended successfully! Fee distribution running in background...", {
          id: loadingToastId,
        });
      }

      setSuccessMessage("Auction ended successfully!");
      
      // Refresh auctions after ending
      await fetchAuctions();
      // Switch to ended tab to show the ended auction
      setActiveTab("ended");
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      setIsLoading(false);
      setEndingAuction(null);
    } catch (error) {
      console.error("Error ending auction:", error);
      if (loadingToastId) {
        toast.error(`Failed to end auction: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          id: loadingToastId,
        });
      }
      setIsLoading(false);
      setEndingAuction(null);
    }
  };

  const fetchAuctions = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/protected/auctions/my-auctions?id=${user?.socialId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Fetch auctions response:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuctionsResponse = await response.json();

      console.log("Fetched auctions:", data);

      if (data.success) {
        setAuctions(data.auctions || []);
      } else {
        throw new Error("Failed to fetch auctions");
      }
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch auctions");
    } finally {
      setLoading(false);
    }
  };

  const endAuction = async (blockchainAuctionId: string) => {
    try {
      //check if address exists
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }
      setEndingAuction(blockchainAuctionId);
      setSuccessMessage(null);

      const toastId = toast.loading("Preparing to end auction...");
      setLoadingToastId(toastId);
      setIsLoading(true);

      // Step 1: Get all bidders from the smart contract
      toast.loading("Fetching auction data...", { id: toastId });
      
      const contract = await readContractSetup(
        contractAdds.auctions,
        auctionAbi
      );
      if (!contract) {
        console.log("Contract not found!")
        throw new Error("Failed to setup contract connection");
      }

      console.log("Contract", contract);

      // Get bidders from contract
      const contractBidders = await contract?.getBidders(blockchainAuctionId);
      console.log("Contract Bidders:", contractBidders);

      const auctionMeta = await contract?.getAuctionMeta(blockchainAuctionId);
      console.log("Contract Meta:", auctionMeta);

      const localErc20Contract = await readContractSetup(auctionMeta.caInUse, erc20Abi);
      if (!localErc20Contract) {
        console.log("ERC20 Contract not found!")
        throw new Error("Failed to setup ERC20 contract connection");
      }

      const decimals = await localErc20Contract.decimals();
      console.log("Token Decimals:", decimals);

      const formattedBidders = contractBidders.map((item: any) => ({
        bidder: item[0], 
        bidAmount: ethers.formatUnits(item[1],  decimals), 
        fid: item[2]
      }));

      if (!context) {
        const wallet = externalWallets[0];
        if (!wallet) {
          toast.error("Unable to find a connected wallet", { id: toastId });
          setIsLoading(false);
          setEndingAuction(null);
          return;
        }

        await wallet.switchChain(baseChain.id);
        const provider = await wallet.getEthereumProvider();
        const endAuctionData = encodeFunctionData({
          abi: auctionAbi,
          functionName: "endAuction",
          args: [blockchainAuctionId],
        });

        const callsRequest = {
          version: "1.0",
          chainId: numberToHex(baseChain.id),
          atomicRequired: true,
          from: wallet.address,
          calls: [
            {
              to: contractAdds.auctions as `0x${string}`,
              data: endAuctionData,
              value: "0x0",
              capabilities: {
                gasLimitOverride: "0x7a120",
              },
            },
          ],
        } as const;

        try {
          toast.loading("Submitting transaction...", { id: toastId });
          const callsResponse = await provider.request({
            method: "wallet_sendCalls",
            params: [callsRequest],
          });

          const callsId =
            typeof callsResponse === "string"
              ? callsResponse
              : (callsResponse as { callsId?: string; id?: string })?.callsId ??
                (callsResponse as { callsId?: string; id?: string })?.id;

          if (!callsId) {
            throw new Error("Failed to retrieve smart wallet callsId");
          }

          toast.loading("Transaction submitted, checking status...", { id: toastId });

          const confirmed = await checkStatus(callsId);

          if (!confirmed) {
            toast.error("Transaction failed or timed out", { id: toastId });
            setIsLoading(false);
            setEndingAuction(null);
            return;
          }

          await processEndAuctionSuccess(blockchainAuctionId, formattedBidders);
          return;
        } catch (walletSendError) {
          console.warn("wallet_sendCalls unavailable, falling back to direct transaction", walletSendError);

          const writeContract = await writeNewContractSetup(
          contractAdds.auctions,
          auctionAbi,
          externalWallets[0]
        );

        if (!writeContract) {
          throw new Error("Failed to setup write contract");
        }

        toast.loading("Waiting for transaction...", { id: toastId });
        
        const tx = await writeContract.endAuction(blockchainAuctionId);
        await tx.wait(); // Wait for transaction confirmation

        if(!tx){
          toast.error("Transaction failed", { id: toastId });
          setIsLoading(false);
          setEndingAuction(null);
          return;
        }

        await processEndAuctionSuccess(blockchainAuctionId, formattedBidders);
        }
      } else {
        const calls = [
          {
            to: contractAdds.auctions as `0x${string}`,
            value: context?.client.clientFid !== 309857 ? BigInt(0) : "0x0",

            data: encodeFunctionData({
              abi: auctionAbi,
              functionName: "endAuction",
              args: [blockchainAuctionId],
            }),
            capabilities: {
            gasLimitOverride: {
              value: "0x7a1200", // 8,000,000 in hex
            },
          },
          },
          
        ];

        setCurrentEndingAuction({
          auctionId: blockchainAuctionId,
          bidders: formattedBidders
        });

        if (context?.client.clientFid === 309857) {
          toast.loading("Connecting to Base SDK...", { id: toastId });
          
          const provider = createBaseAccountSDK({
            appName: "Bill test app",
            appLogoUrl: "https://www.houseproto.fun/pfp.jpg",
            appChainIds: [base.constants.CHAIN_IDS.base],
          }).getProvider();

          const cryptoAccount = await getCryptoKeyAccount();
          const fromAddress = cryptoAccount?.account?.address;

          toast.loading("Submitting transaction...", { id: toastId });

          const callsId:any = await provider.request({
            method: "wallet_sendCalls",
            params: [
              {
                version: "1.0",
                from: fromAddress,
                chainId: numberToHex(base.constants.CHAIN_IDS.base),
                atomicRequired: true,
                calls: calls,
              },
            ],
          });

          const result = await checkStatus(callsId);

          if (result) {
            await processEndAuctionSuccess(blockchainAuctionId, formattedBidders);
          } else {
            toast.error("Transaction failed or timed out", { id: toastId });
            setIsLoading(false);
          }
        } else {
          toast.loading("Waiting for wallet confirmation...", { id: toastId });
          
          sendCalls({
            account: address as `0x${string}`,
            //@ts-ignore
            calls: calls,
          });
        }
        
        // processEndAuctionSuccess will be called when transaction succeeds via useEffect
      }
    } catch (err) {
      console.error("Error ending auction:", err);
      if (loadingToastId) {
        toast.error(err instanceof Error ? err.message : "Failed to end auction", {
          id: loadingToastId,
        });
      }
      setIsLoading(false);
      setEndingAuction(null);
      setCurrentEndingAuction(null);
    }
  };

  const viewAuction = (blockchainAuctionId: string) => {
    navigate(`/bid/${blockchainAuctionId}`);
    console.log("Viewing auction:", blockchainAuctionId);
    // You can implement navigation here, for example:
    // router.push(`/auction/${blockchainAuctionId}`);
  };

  useEffect(() => {
    if (user) {
      fetchAuctions();
    }
  }, [user]);

  if (loading && !auctions.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your auctions..." />
      </div>
    );
  }

  if (!address) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Auctions</h1>
        <EmptyState
          icon={Package}
          title="Authentication Required"
          description="Please connect your wallet to view and manage your auctions."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your auctions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAuctions} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const filteredAuctions = auctions.filter(
    (auction) => auction?.status === activeTab
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Auctions</h1>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
        >
          <p className="text-green-400">{successMessage}</p>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(["active", "ended"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300 capitalize",
              activeTab === tab
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <EmptyState
          icon={Hammer}
          title={`No ${activeTab} Auctions`}
          description={`There are currently no ${activeTab} auctions available.`}
        />
      ) : (
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
          {filteredAuctions.map((auction, index) => auction ? (
            <motion.div
              key={auction._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <AuctionCard
                auction={auction}
                showActions={true}
                actions={
                  <div className="flex gap-2">
                    {auction.status === "active" && (
                      <Button
                        onClick={() => endAuction(auction.blockchainAuctionId)}
                        disabled={isLoading || endingAuction === auction.blockchainAuctionId}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        {(isLoading && endingAuction === auction.blockchainAuctionId) ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Ending...
                          </>
                        ) : (
                          <>
                            <Hammer className="h-4 w-4 mr-2" />
                            End Auction
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={() => viewAuction(auction.blockchainAuctionId)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                }
              />
            </motion.div>
          ) : null)}
        </motion.div>
      )}
    </div>
  );
}
