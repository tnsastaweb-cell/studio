
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
    href: "/calendar",
     children: [
        { title: "MGNREGS", href: "/calendar/mgnregs", highlighted: true },
        { title: "PMAY-G", href: "/calendar/pmay-g" },
        { title: "NSAP", href: "/calendar/nsap" },
        { title: "NMP", href: "/calendar/nmp" },
        { title: "FFCG", href: "/calendar/ffcg" },
        { title: "DSJE", href: "/calendar/dsje" },
        { title: "OTHERS", href: "/calendar/others" },
    ]
  },
  {
    title: "GALLERY",
    href: "/gallery",
    children: [
      { title: "Photos", href: "/gallery/photos" },
      { title: "Videos", href: "/gallery/videos" },
      { title: "New's Repots", href: "/gallery/news-reports" },
      { title: "Blog", href: "/gallery/blog" },
    ],
  },
  {
    title: "SA REPORTS",
    href: "/sa-reports",
    children: [
        { title: "MIS Report", href: "/sa-reports/mis-report" },
        { title: "Consolidated Reports", href: "/sa-reports/consolidated" },
        { title: "Reports in MGNREGS website", href: "/sa-reports/mgnregs-reports" },
        { title: "Reports in MSJE website", href: "/sa-reports/msje-reports" },
    ]
  },
  {
    title: "LIBRARY",
    href: "/library",
  },
  {
    title: "GRIEVANCES",
    href: "/grievances",
    children: [
        { title: "Apply for Grievance", href: "/grievances/apply" },
        { title: "Grievance Status", href: "/grievances/status" },
        { title: "Grievance Summary", href: "/grievances/summary" },
    ]
  },
];

const signedInMenuItems = [
    { 
      title: "REGISTRATION", 
      href: "/registration",
      children: [
        { title: "DISTRICT OFFICE REGISTRATION", href: "/registration/district-office" },
        { title: "STAFF REGISTRATION", href: "/registration/staff" },
        { title: "VRP REGISTRATION", href: "/registration/vrp" },
      ]
    },
    { 
      title: "DATA ENTRY", 
      href: "/data-entry",
      children: [
        { title: "MGNREGS", href: "/data-entry/mgnregs" },
        { title: "PMAY-G", href: "/data-entry/pamy-g" },
        { title: "NSAP", href: "/data-entry/nsap" },
        { title: "NMP", href: "/data-entry/nmp" },
        { title: "FFCG", href: "/data-entry/ffcg" },
        { title: "DSJE", href: "/data-entry/dsje" },
        { title: "HLC", href: "/data-entry/hlc" },
        { title: "STATE/DISTRICT ASSEMBLY", href: "/data-entry/assembly" },
      ]
    },
    { 
      title: "DAILY ACTIVITES", 
      href: "/daily-activities",
      children: [
        { title: "DAILY ATTENDENCE", href: "/daily-activities/attendance" },
        { title: "TOUR DAIRY", href: "/daily-activities/tour-diary" },
        { title: "MOVEMENT REGISTER", href: "/daily-activities/movement-register" },
      ]
    },
    { 
      title: "REPORTS", 
      href: "/reports",
      children: [
        { title: "WEEKLY REPORTS", href: "/reports/weekly" },
        { title: "OTHERS", href: "/reports/others" },
      ]
    },
];

const MenuBar = ({ items }: { items: (typeof guestMenuItems[0] & {children?: {title: string; href: string; highlighted?: boolean}[]})[] }) => {
    const pathname = usePathname();
    return (
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {items.map((item, index) => (
                <React.Fragment key={item.title}>
                    {item.children ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                            {item.title}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        {item.children.map((child) => (
                            <DropdownMenuItem key={child.title} asChild className={cn(child.highlighted && "bg-accent/80 font-bold")}>
                            <Link href={child.href}>{child.title}</Link>
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    ) : (
                    <Button asChild variant={pathname === item.href ? "secondary" : "ghost"} className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <Link href={item.href}>{item.title}</Link>
                    </Button>
                    )}
                    {index < items.length - 1 && (
                        <div className="h-4 w-px bg-primary/20" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export function MainNavigation() {
  const { isSignedIn } = useAuth();
  
  return (
    <nav className="bg-secondary w-full flex flex-col items-center shadow-md sticky top-[80px] z-40">
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
