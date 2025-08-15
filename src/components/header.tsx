
"use client";

import Link from "next/link";
import { Mountain, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";


export function Header() {
  const { user, signOut, isSignedIn } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  }
  
  const canAccessAdminPanel = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  return (
    <header className="px-4 lg:px-6 h-20 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <Link href="/" className="flex items-center gap-3" prefetch={false}>
        <div className="w-10 h-10 border-2 border-primary rounded-md flex items-center justify-center">
          <Mountain className="h-6 w-6 text-primary" />
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
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span>{user?.name}</span>
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
