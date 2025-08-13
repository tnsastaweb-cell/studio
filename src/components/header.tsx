
"use client";

import Link from "next/link";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    isSignedIn: boolean;
    setIsSignedIn: (isSignedIn: boolean) => void;
}

export function Header({ isSignedIn, setIsSignedIn }: HeaderProps) {
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
        <Button asChild variant="link" className="text-primary hidden sm:inline-flex">
          <Link href="/admin" prefetch={false}>
            Admin Panel
          </Link>
        </Button>
        <Button onClick={() => setIsSignedIn(!isSignedIn)} size="sm">
            {isSignedIn ? "Sign Out (Demo)" : "Sign In (Demo)"}
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Sign Up
        </Button>
      </nav>
    </header>
  );
}
