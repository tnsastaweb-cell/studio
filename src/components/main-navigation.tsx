
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const guestMenuItems = [
  { title: "HOME", href: "/" },
  { title: "ABOUT US", href: "/about" },
  { title: "SCHEMES", href: "/schemes" },
  { title: "CALENDAR", href: "/calendar" },
  { title: "GALLERY", href: "/gallery" },
  { title: "SA REPORTS", href: "/sa-reports" },
  { title: "LIBRARY", href: "/library" },
  { title: "GRIEVANCES", href: "/grievances" },
];

const signedInMenuItems = [
    { title: "REGISTRATION", href: "/registration" },
    { title: "DATA ENTRY", href: "/data-entry" },
    { title: "DAILY ACTIVITES", href: "/daily-activities" },
    { title: "REPORTS", href: "/reports" },
];

interface MainNavigationProps {
    isSignedIn: boolean;
    setIsSignedIn: (isSignedIn: boolean) => void;
}

export function MainNavigation({ isSignedIn, setIsSignedIn }: MainNavigationProps) {
  return (
    <nav className="bg-secondary w-full flex flex-col items-center py-2 shadow-md sticky top-[80px] z-40">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        {guestMenuItems.map((item) => (
          <Button key={item.title} asChild variant="ghost" className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
            <Link href={item.href}>{item.title}</Link>
          </Button>
        ))}
      </div>
      
      {isSignedIn && (
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center mt-2">
            {signedInMenuItems.map((item) => (
            <Button key={item.title} asChild variant="ghost" className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Link href={item.href}>{item.title}</Link>
            </Button>
            ))}
        </div>
      )}

      {/* This button is for demonstrating the menu change. You should remove it and use your actual authentication logic. */}
      <Button onClick={() => setIsSignedIn(!isSignedIn)} className="absolute right-4" size="sm">
        {isSignedIn ? "Sign Out (Demo)" : "Sign In (Demo)"}
      </Button>
    </nav>
  );
}
