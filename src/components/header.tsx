
'use client';

import Link from 'next/link';
import { LogOut, UserCircle, Upload } from 'lucide-react';
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
import { useLogo } from '@/hooks/use-logo';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function Header() {
  const { user, signOut, isSignedIn, loading } = useAuth();
  const { logo } = useLogo();
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
            {logo ? (
                <Image src={logo} alt="Sasta logo" width={64} height={64} className="object-contain" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
        </div>
        <div className="flex flex-col">
          <span className="font-impact text-2xl font-bold text-primary tracking-wider">SASTA</span>
          <span className="text-xs text-muted-foreground font-semibold -mt-1">SOCIAL AUDIT UNIT OF TAMIL NADU</span>
        </div>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
        <div id="google_translate_element"></div>
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
              <Button variant="ghost" className="flex items-center gap-2 text-left h-auto p-1 rounded-full">
                 <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || undefined} alt={user?.name} />
                    <AvatarFallback>
                        <UserCircle className="h-8 w-8" />
                    </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
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
