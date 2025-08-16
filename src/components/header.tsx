
'use client';

import Link from 'next/link';
import { LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';


const TamilNaduLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-full w-full">
        <path fill="#FFF" d="M256 0C114.615 0 0 114.615 0 256c0 141.385 114.615 256 256 256s256-114.615 256-256C512 114.615 397.385 0 256 0z"/>
        <path fill="#333" d="M256 41.5l20.4 63.8h67.1l-54.3 39.4 20.4 63.8-54.3-39.4-54.3 39.4 20.4-63.8-54.3-39.4h67.1z"/>
        <path fill="#000" stroke="#000" strokeWidth="2" d="M256 128.3c-70.6 0-128 57.4-128 128s57.4 128 128 128 128-57.4 128-128-57.4-128-128-128zm0 230.4c-56.5 0-102.4-45.9-102.4-102.4S199.5 154.7 256 154.7s102.4 45.9 102.4 102.4-45.9 102.4-102.4 102.4z"/>
        <text fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" textAnchor="middle" x="256" y="93.923" fill="#333">தமிழ் நாடு</text>
        <text fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" textAnchor="middle" x="256" y="446.404" fill="#333">வாய்மையே வெல்லும்</text>
    </svg>
);


export function Header() {
  const { user, signOut, isSignedIn, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  }
  
  // We should wait until loading is false before checking user roles.
  if (loading) {
    // You can return a loading indicator here if needed
    return <header className="px-4 lg:px-6 h-20 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b" />;
  }
  
  const canAccessAdminPanel = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  return (
    <header className="px-4 lg:px-6 h-20 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <Link href="/" className="flex items-center gap-3" prefetch={false}>
         <div className="w-16 h-16 flex items-center justify-center">
            <TamilNaduLogo />
        </div>
        <div className="flex flex-col">
          <span className="font-impact text-2xl font-bold text-primary tracking-wider">SASTA</span>
          <span className="text-xs text-muted-foreground font-semibold -mt-1">SOCIAL AUDIT UNIT OF TAMIL NADU</span>
        </div>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
        {canAccessAdminPanel && (
          <Button asChild variant="link" className="text-primary hidden sm:inline-flex">
            <Link href="/admin" prefetch={false}>
              Admin Panel
            </Link>
          </Button>
        )}
        
        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-left h-auto">
                <UserCircle className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="font-bold">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.designation}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                 <Link href="/reset-password">Change Password</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button asChild>
              <Link href="/signin" prefetch={false}>
                Sign In
              </Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
