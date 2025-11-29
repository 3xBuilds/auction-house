import { useLoginWithOAuth, usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

export default function LoginWithOAuth() {
  const { user, authenticated } = usePrivy();
  const { state, loading, initOAuth } = useLoginWithOAuth({
        onComplete: ({ user, isNewUser }) => {
            console.log('User logged in successfully', user);
            if (isNewUser) {
                
            }
        },
        onError: (error) => {
            console.error('Login failed', error);
        }
    });

  const handleLogin = async () => {
      try {
          // The user will be redirected to OAuth provider's login page
          await initOAuth({ provider: 'twitter' });
      } catch (err) {
          // Handle errors (network issues, validation errors, etc.)
          console.error(err);
      }
  };

  console.log('OAuth State:', state);

  // Check if user is authenticated and has Twitter profile
  const twitterAccount = user?.twitter;

  return (
      <div>
          {authenticated && twitterAccount ? (
              <div className="flex items-center gap-2">
                  {twitterAccount.profilePictureUrl && (
                      <Image
                      unoptimized
                          src={twitterAccount.profilePictureUrl}
                          alt={twitterAccount.username || 'Twitter Profile'}
                          width={32}
                          height={32}
                          className="rounded-full"
                      />
                  )}
                  <span className="text-sm font-medium">
                      @{twitterAccount.username}
                  </span>
              </div>
          ) : (
              <button onClick={handleLogin} disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in with Twitter'}
              </button>
          )}
      </div>
  );
}