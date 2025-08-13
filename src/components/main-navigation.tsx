"use client";
import React, { useState } from "react";
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
  ...guestMenuItems,
  { title: "REGISTRATION", href: "/registration" },
  { title: "DATA ENTRY", href: "/data-entry" },
  { title: "DAILY ACTIVITIES", href: "/daily-activities" },
  { title: "REPORTS", href: "/reports" },
];

export function MainNavigation() {
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const menuItems = isSignedIn ? signedInMenuItems : guestMenuItems;

  return (
    <nav className="bg-secondary w-full flex justify-center py-2 shadow-md sticky top-[80px] z-40">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        {menuItems.map((item) => (
          <Button key={item.title} asChild variant="ghost" className="text-primary hover:bg-accent font-bold text-xs sm:text-base px-2 sm:px-4 py-2">
            <Link href={item.href}>{item.title}</Link>
          </Button>
        ))}
        {/* This button is for demonstrating the menu change. You should remove it and use your actual authentication logic. */}
        <Button onClick={() => setIsSignedIn(!isSignedIn)} className="absolute right-4" size="sm">
          {isSignedIn ? "Sign Out (Demo)" : "Sign In (Demo)"}
        </Button>
      </div>
    </nav>
  );
}