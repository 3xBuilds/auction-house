import { useGlobalContext } from '@/utils/providers/globalContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import { MdWallet } from 'react-icons/md';
import { CiLogin } from "react-icons/ci";
import { useState } from 'react';
import ProfileDrawer from '../UI/ProfileDrawer';

interface WalletConnectProps {
  onProfileClick?: () => void;
}

export const WalletConnect = ({ onProfileClick }: WalletConnectProps = {}) => {
  const { user, isFarcasterContext } = useGlobalContext();
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setIsProfileDrawerOpen(true);
    }
  };

  const handleLogin = () => {
    login();
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state
  if (!ready) {
    return (
      <div
        style={{
          opacity: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <button
          type="button"
          className="text-center w-full flex gap-1 px-2 max-lg:py-1 py-3 gradient-button items-center justify-center rounded text-md font-bold text-white"
          disabled
        >
          Loading...
        </button>
      </div>
    );
  }

  // Not connected - show login button
  if (!authenticated) {
    return (
      <>
        <button
          onClick={handleLogin}
          type="button"
          className="text-center w-full flex gap-1 px-2 max-lg:py-1 py-3 gradient-button items-center justify-center rounded text-md font-bold text-white"
        >
          Login<CiLogin className='text-xl'/>
        </button>
      </>
    );
  }

  // Connected - show user profile
  return (
    <>
      {/* If user exists and has complete profile info, show profile */}
      {user && user?.pfp_url !== "" && user?.username !== "" ? (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleProfileClick}
            type="button"
            className="flex bg-primary/10 lg:p-2 items-center gap-2 text-center w-full rounded-lg text-md font-bold text-white hover:bg-primary/20 transition-colors"
          >
            <div className='flex items-center gap-2'>
              <Image unoptimized
                alt="Profile Picture"
                src={user?.pfp_url}
                width={40}
                height={40}
                className="lg:w-8 lg:h-8 h-6 w-6 aspect-square border border-primary rounded-md"
              />
              <div className='flex flex-col text-left max-lg:hidden'>
                <span className='text-sm font-medium'>{user?.username}</span>
              </div>
            </div>
          </button>
        </div>
      ) : (
        // Fallback for when user exists but profile is incomplete
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleProfileClick}
            type="button"
            className="flex bg-primary/10 lg:p-2 items-center gap-2 text-center w-full rounded-lg text-md font-bold text-white hover:bg-primary/20 transition-colors"
          >
            <div className='flex items-center gap-2'>
              <div className="lg:w-8 lg:h-8 h-6 w-6 aspect-square border border-primary rounded-md bg-gray-600 flex items-center justify-center">
                <MdWallet className='text-sm' />
              </div>
              <div className='flex flex-col text-left max-lg:hidden'>
                <span className='text-sm font-medium'>
                  {wallets[0]?.address ? 
                    `${wallets[0].address.slice(0, 6)}...${wallets[0].address.slice(-4)}` : 
                    'Connected'
                  }
                </span>
              </div>
            </div>
          </button>
        </div>
      )}
      
      <ProfileDrawer 
        isOpen={isProfileDrawerOpen} 
        onClose={() => setIsProfileDrawerOpen(false)} 
      />
    </>
  );
};