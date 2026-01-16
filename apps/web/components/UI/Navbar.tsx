"use client";

import { useGlobalContext } from "@/utils/providers/globalContext";
import Image from "next/image";
import Link from "next/link";
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader";
import { useRouter, usePathname } from "next/navigation";
import {
  Info,
  Trophy,
  QrCode,
  User,
  PlusCircle,
} from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import LoginWithOAuth from "../utils/twitterConnect";
import AggregateConnector from "../utils/aggregateConnector";

export default function Navbar() {
  const { wallets } = useWallets();
  const externalWallets = wallets.filter(
    (wallet) => wallet.walletClientType !== "privy"
  );

  const { user } = useGlobalContext();
  const address =
    externalWallets.length > 0 ? externalWallets[0].address : null;
  const navigateWithLoader = useNavigateWithLoader();
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigateWithLoader(path);
  };

  const router = useRouter();

  const { authenticated } = usePrivy();

  return (
    <>
      {/* Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-white/30 z-50 lg:hidden">
        <div className="w-full h-full flex justify-around items-center px-2">
          {/* Auctions */}
          <button
            onClick={() => {
              router.push("/");
            }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <div className={` ${pathname === "/" && "selected-gradient w-7 flex items-center justify-center aspect-square rounded-md"} `}>
              <Image
                src="/pfp.jpg"
                alt="Auctions"
                width={20}
                height={20}
                className={`rounded-md mb-0.5 ${pathname === "/" ? "opacity-100" : "opacity-60"}`}
              />
            </div>
            <span className={`text-[10px] ${pathname === "/" ? "text-primary" : "text-white/60"}`}>
              Auctions
            </span>
          </button>

          {/* Leaderboard */}
          <a
            href="/leaderboard"
            onClick={(e) => handleNavClick(e, "/leaderboard")}
            className="flex flex-col items-center justify-center flex-1"
          ><div className={` ${pathname=== "/leaderboard" && "selected-gradient w-7 flex items-center justify-center aspect-square rounded-md"} `}>
            <Trophy className={`w-5 h-5 mb-0.5 ${pathname === "/leaderboard" ? "text-white " : "text-white/60"}`} />
          </div>
            
            <span className={`text-[10px] ${pathname === "/leaderboard" ? "text-primary" : "text-white/60"}`}>
              Leaderboard
            </span>
          </a>

          {/* Create */}
          {authenticated && address && (
            <a
              href="/create"
              onClick={(e) => handleNavClick(e, "/create")}
              className="flex flex-col items-center justify-center flex-1"
            >
              <div className={` ${pathname === "/create" && "selected-gradient w-7 flex items-center justify-center aspect-square rounded-md"} `}>
                <PlusCircle className={`w-5 h-5 mb-0.5 ${pathname === "/create" ? "text-white" : "text-primary/70"}`} />
              </div>
              <span className={`text-[10px] ${pathname === "/create" ? "text-primary" : "text-primary/60"}`}>
                Create
              </span>
            </a>
          )}

          {/* Info */}
          <a
            href="/info"
            onClick={(e) => handleNavClick(e, "/info")}
            className="flex flex-col items-center justify-center flex-1"
          >
            <div className={` ${pathname === "/info" && "selected-gradient w-7 flex items-center justify-center aspect-square rounded-md"} `}>
              <Info className={`w-5 h-5 mb-0.5 ${pathname === "/info" ? "text-white" : "text-white/60"}`} />
            </div>
            <span className={`text-[10px] ${pathname === "/info" ? "text-primary" : "text-white/60"}`}>
              Info
            </span>
          </a>

          {/* Profile */}
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex flex-col items-center">
              <div className={` ${pathname === "/profile" && "selected-gradient w-7 flex items-center justify-center aspect-square rounded-md"} `}>
                <AggregateConnector/>
              </div>
              <span className={`text-[10px] ${pathname === "/profile" ? "text-primary" : "text-white/60"}`}>
                Profile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Bottom Navbar */}
      <div className="hidden lg:flex lg:fixed lg:bottom-0 lg:left-0 lg:right-0 h-24 lg:items-center lg:justify-between lg:px-6 lg:z-50">
        {/* Left - AggregateConnector */}
        <div className="flex items-center">
          <AggregateConnector />
        </div>

        {/* Center - Floating Mini Navbar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md ">
          {/* House Logo */}
          <button
            onClick={() => {
              router.push("/");
            }}
            className={` rounded-xl overflow-hidden transition-all hover:scale-105 duration-200 ${
              pathname === "/"
                ? "text-white shadow-lg shadow-primary/30"
                : "text-white hover:text-white hover:bg-white/10 bg-white/5"
            }`}
          >
            <Image
              src="/pfp.jpg"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-xl"
            />
          </button>

          {/* Separator */}
          <div className="w-[2px] h-8 bg-white/10"></div>

          {/* Leaderboard */}
          <a
            href="/leaderboard"
            onClick={(e) => handleNavClick(e, "/leaderboard")}
            className={`p-2 w-[48px] aspect-square flex items-center justify-center rounded-xl transition-all hover:scale-105 duration-200 ${
              pathname === "/leaderboard"
                ? "text-white selected-gradient"
                : "text-white hover:text-white hover:bg-white/10 bg-white/5"
            }`}
          >
            <Trophy className="w-6 h-6" />
          </a>

          {/* Information */}
          <a
            href="/info"
            onClick={(e) => handleNavClick(e, "/info")}
            className={`p-2 w-[48px] aspect-square flex items-center justify-center rounded-xl transition-all hover:scale-105 duration-200 ${
              pathname === "/info"
                ? "text-white selected-gradient"
                : "text-white hover:text-white hover:bg-white/10 bg-white/5"
            }`}
          >
            <Info className="w-6 h-6" />
          </a>

          {/* Profile */}
          <a
            href="/profile"
            onClick={(e) => handleNavClick(e, "/profile")}
            className={`p-2 w-[48px] aspect-square flex items-center justify-center rounded-xl transition-all hover:scale-105 duration-200 ${
              pathname === "/profile"
                ? "text-white selected-gradient"
                : "text-white hover:text-white hover:bg-white/10 bg-white/5"
            }`}
          >
            <User className="w-6 h-6" />
          </a>

          {authenticated && address && (
            <>
            {/* Separator */}
            <div className="w-[2px] h-8 bg-white/10"></div>

            {/* Create Button */}
            <a
              href="/create"
              onClick={(e) => handleNavClick(e, "/create")}
              className={`p-2 w-[48px] aspect-square flex items-center justify-center rounded-xl transition-all hover:scale-105 duration-200 ${
                pathname === "/create"
                  ? "text-white selected-gradient"
                  : "text-primary/70 bg-primary/10 hover:text-primary/90 hover:bg-primary/30"
              }`}
            >
              <PlusCircle className="w-6 h-6" />
            </a>
          </>)}
        </div>

        {/* Right - Empty space for balance */}
        <div className="w-[200px]"></div>
      </div>
    </>
  );
}
