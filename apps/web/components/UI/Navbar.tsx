'use client'

import { useGlobalContext } from "@/utils/providers/globalContext"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useNavigateWithLoader } from "@/utils/useNavigateWithLoader"
import { useRouter, usePathname } from "next/navigation"
import { RiSearchLine, RiInformationLine, RiAddCircleLine, RiTrophyLine, RiQrScanLine, RiUserLine, RiHomeLine } from "react-icons/ri"
import { Bell, Sparkles } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { GoDotFill } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion"
import LoginWithOAuth from "../utils/twitterConnect"
import AggregateConnector from "../utils/aggregateConnector"
import UserWidget from "./UserWidget"
import NotificationModal from "./NotificationModal"


export default function Navbar(){

    const {user} = useGlobalContext()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [notificationModalOpen, setNotificationModalOpen] = useState(false)
    const [hasNotifications, setHasNotifications] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigateWithLoader = useNavigateWithLoader()
    const pathname = usePathname()
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const { authenticated, login, getAccessToken } = usePrivy()

    // Scroll detection for floating navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Check notification status
    useEffect(() => {
        const checkNotifications = async () => {
            if (!user?.socialId) return;
            
            try {
                const accessToken = await getAccessToken();
                const response = await fetch(`/api/users/profile?socialId=${user.socialId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasNotifications(!!data.user?.notificationDetails?.token);
                }
            } catch (error) {
                console.error('Failed to check notification status:', error);
            }
        };

        if (authenticated && user) {
            checkNotifications();
        }
    }, [user?.socialId, authenticated, getAccessToken]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    const handleNavClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault()
        setIsMenuOpen(false)
        navigateWithLoader(path)
    }

    const router = useRouter()

    const navItems = [
        { href: '/', label: 'Home', icon: RiHomeLine },
        { href: '/create', label: 'Create', icon: RiAddCircleLine },
        { href: '/leaderboard', label: 'Leaderboard', icon: RiTrophyLine },
        { href: '/earn', label: 'Earn', icon: Sparkles },
        { href: '/info', label: 'Info', icon: RiInformationLine },
    ]

    return (
        <>
            {/* Notification Modal */}
            <NotificationModal 
                isOpen={notificationModalOpen}
                onClose={() => setNotificationModalOpen(false)}
            />

            {/* User Widget - Desktop Only */}
            <UserWidget 
                isAuthenticated={authenticated}
                onConnect={() => login()}
            />

            {/* Floating Desktop Navbar */}
            <motion.nav 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className={`hidden lg:block fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? 'pb-4' : 'pb-6'
                }`}
            >
                <div className={`max-w-7xl mx-auto px-6 transition-all duration-300`}>
                    <motion.div 
                        className={`relative rounded-2xl border transition-all duration-300 ${
                            scrolled 
                                ? 'bg-black/80 backdrop-blur-xl border-white/10 shadow-xl shadow-purple-500/10' 
                                : 'bg-white/5 backdrop-blur-md border-white/5'
                        }`}
                    >
                        {/* Gradient glow effect */}
                        <div className="absolute -inset-[1px] bg-linear-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"></div>
                        
                        <div className="flex items-center justify-between px-6 py-4">
                            {/* Logo */}
                            <button 
                                onClick={() => router.push("/")}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 group-hover:border-purple-500/60 transition-colors relative">
                                    <Image src="/pfp.jpg" alt="House" width={40} height={40} className="scale-125" />
                                </div>
                                <span className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    House
                                </span>
                            </button>

                            {/* Center Navigation */}
                            <div className="flex items-center gap-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            onClick={(e) => handleNavClick(e, item.href)}
                                            className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg"
                                                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                                />
                                            )}
                                            <span className="relative flex items-center gap-2">
                                                <Icon className="text-lg" />
                                                {item.label}
                                            </span>
                                        </a>
                                    )
                                })}
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                                {authenticated && (
                                    <button
                                        onClick={() => setNotificationModalOpen(true)}
                                        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                    >
                                        <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        {hasNotifications && (
                                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                )}
                                
                                <div className="pl-3 border-l border-white/10">
                                    <AggregateConnector />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.nav>

            {/* Mobile Navbar */}
            <div className="lg:hidden">
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
                    ref={mobileMenuRef}
                >
                    <div className={`rounded-2xl border transition-all duration-300 ${
                        isMenuOpen || scrolled
                            ? 'bg-black/90 backdrop-blur-xl border-white/10 shadow-xl' 
                            : 'bg-white/5 backdrop-blur-md border-white/5'
                    }`}>
                        <div className="grid grid-flow-col items-center px-2 py-3">
                            <button 
                                onClick={() => router.push("/")}
                                className="flex items-center justify-center"
                            >
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/30">
                                    <Image src="/pfp.jpg" alt="House" width={32} height={32} className="scale-125" />
                                </div>
                            </button>

                            {authenticated && (
                                <>
                                    <button
                                        onClick={(e) => handleNavClick(e as any, '/create')}
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                            pathname === '/create'
                                                ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <RiAddCircleLine className="text-xl" />
                                    </button>
                                    <button
                                        onClick={(e) => handleNavClick(e as any, '/leaderboard')}
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                            pathname === '/leaderboard'
                                                ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <RiTrophyLine className="text-xl" />
                                    </button>
                                    <button
                                        onClick={(e) => handleNavClick(e as any, '/earn')}
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                            pathname === '/earn'
                                                ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center justify-center">
                                        <AggregateConnector />
                                    </div>
                                    <button 
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"
                                    >
                                        <div className="flex flex-col gap-1 w-5 h-5 justify-center items-center">
                                            <motion.div 
                                                animate={{
                                                    rotate: isMenuOpen ? 45 : 0,
                                                    y: isMenuOpen ? 6 : 0
                                                }}
                                                className="w-4 h-0.5 bg-white"
                                            />
                                            <motion.div 
                                                animate={{
                                                    opacity: isMenuOpen ? 0 : 1
                                                }}
                                                className="w-4 h-0.5 bg-white"
                                            />
                                            <motion.div 
                                                animate={{
                                                    rotate: isMenuOpen ? -45 : 0,
                                                    y: isMenuOpen ? -6 : 0
                                                }}
                                                className="w-4 h-0.5 bg-white"
                                            />
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Dropdown */}
                        <AnimatePresence>
                            {authenticated && isMenuOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden border-t border-white/10"
                                >
                                    <div className="p-2">
                                        {navItems.filter(item => item.href === '/' || item.href === '/info').map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.href
                                            return (
                                                <a
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={(e) => handleNavClick(e, item.href)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                                                        isActive
                                                            ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon className="text-lg" />
                                                    {item.label}
                                                </a>
                                            )
                                        })}
                                        
                                        <div className="px-4 py-3">
                                            <AggregateConnector />
                                        </div>
                                        
                                        <button
                                            onClick={() => {
                                                setNotificationModalOpen(true)
                                                setIsMenuOpen(false)
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all w-full relative"
                                        >
                                            <Bell className="text-lg" />
                                            Notifications
                                            {hasNotifications && (
                                                <div className="absolute top-3 left-9 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    )
}