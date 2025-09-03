
'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';

const guestMenuItems = [
  { title: "HOME", href: "/" },
  {
    title: "ABOUT US",
    href: "/about",
    children: [
      { title: "Social Audit Unit", href: "/about" },
      { title: "Governing Body", href: "/about/governing-body" },
      { title: "Executive Committee", href: "/about/executive-committee" },
      { title: "Organizational Structure", href: "/about/organizational-structure" },
      { title: "Directory", href: "/about/directory" },
      { title: "Legal Documents (GOs, Registration)", href: "/about/legal-documents" },
      { title: "Financial Statements", href: "/about/financial-statements" },
      { title: "Annual Reports", href: "/about/annual-reports" },
    ],
  },
  {
    title: "SCHEMES",
    href: "/schemes",
  },
  {
    title: "CALENDAR",
    href: "/calendar/mgnregs",
     children: [
        { title: "MGNREGS", href: "/calendar/mgnregs", disabled: false },
        { title: "PMAY-G", href: "#", disabled: true },
        { title: "NSAP", href: "#", disabled: true },
        { title: "NMP", href: "#", disabled: true },
        { title: "15th CFC", href: "#", disabled: true },
    ]
  },
  {
    title: "GALLERY",
    href: "/gallery",
    children: [
      { title: "All", href: "/gallery"},
      { title: "Photos", href: "/gallery/photos" },
      { title: "Videos", href: "/gallery/videos" },
      { title: "News Reports", href: "/gallery/news-reports" },
      { title: "Blog", href: "/gallery/blog" },
    ],
  },
  {
    title: "SA REPORTS",
    href: "/sa-reports/mis-reports",
     children: [
        { title: "MIS REPORTS", href: "/sa-reports/mis-reports" },
        { title: "Consolidated Reports", href: "#", disabled: true },
        { title: "Reports in MGNREGS website", href: "#", disabled: true },
        { title: "Reports in MSJE website", href: "#", disabled: true },
    ]
  },
  {
    title: "LIBRARY",
    href: "/library",
  },
  {
    title: "CONNECT",
    href: "/connect/location",
    children: [
        { title: "Location", href: "/connect/location" },
        { title: "Careers", href: "/connect/careers" },
        { title: "Write to Us", href: "/connect/write-to-us" },
        { title: "Grievances", href: "/grievances" },
    ]
  },
];

const signedInMenuItems = [
    { 
      title: "REGISTRATION", 
      href: "#",
      children: [
        { title: "OFFICE REGISTRATION", href: "/registration/district-office" },
        { title: "STAFF REGISTRATION", href: "/registration/staff" },
        { title: "VRP REGISTRATION", href: "/registration/vrp" },
      ]
    },
    { 
      title: "DATA ENTRY", 
      href: "/data-entry",
    },
    { 
      title: "DAILY ACTIVITES", 
      href: "#",
      children: [
        { title: "DAILY ATTENDENCE", href: "/daily-activities/daily-attendance" },
        { title: "TOUR DIARY", href: "/daily-activities/tour-diary" },
        { title: "DUTY CERTIFICATE", href: "/daily-activities/duty-certificate", disabled: true },
        { title: "MOVEMENT REGISTER", href: "#", disabled: true },
      ]
    },
    {
      title: "REPORTS",
      href: "#",
       children: [
          { title: "HIGH FM PARA DETAILS", href: "/sa-reports/high-fm-para-details"},
          { title: "CASE STUDIES", href: "/sa-reports/case-studies"},
      ]
    },
];

const MenuBar = ({ items }: { items: (typeof guestMenuItems[0] & {children?: {title: string; href: string; highlighted?: boolean, disabled?: boolean}[]})[] }) => {
    const pathname = usePathname();
    return (
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {items.map((item, index) => (
                <React.Fragment key={item.title}>
                    {index > 0 && <div className="h-4 w-px bg-foreground/30" />}
                    {item.children ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2",
                            item.children.some(child => pathname.startsWith(child.href) && child.href !== "/") && "bg-accent"
                          )}
                        >
                            {item.title}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        {item.children.map((child) => (
                           <React.Fragment key={child.title}>
                             <DropdownMenuItem asChild className={cn("focus:bg-accent focus:text-accent-foreground", pathname === child.href && "bg-accent/80 font-bold")} disabled={child.disabled}>
                                 <Link href={child.href}>{child.title}</Link>
                             </DropdownMenuItem>
                            </React.Fragment>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    ) : (
                    <Button asChild variant={pathname === item.href ? "secondary" : "ghost"} className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <Link href={item.href}>{item.title}</Link>
                    </Button>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export function MainNavigation() {
  const { isSignedIn } = useAuth();
  
  return (
    <nav className="bg-card w-full flex flex-col items-center shadow-md sticky top-[80px] z-40">
      <div className="py-2 w-full border-b">
        <MenuBar items={guestMenuItems} />
      </div>
      {isSignedIn && (
         <div className="py-2 w-full bg-primary/10">
            <MenuBar items={signedInMenuItems} />
        </div>
      )}
    </nav>
  );
}
