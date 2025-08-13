
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

const guestMenuItems = [
  { title: "HOME", href: "/" },
  {
    title: "ABOUT US",
    href: "/about",
    children: [
      { title: "Social Audit Unit", href: "/about/social-audit-unit" },
      { title: "Who is who", href: "/about/who-is-who" },
      { title: "Governing Body", href: "/about/governing-body" },
      { title: "Executive Committee", href: "/about/executive-committee" },
      { title: "Legal Documents (GOs, Registration)", href: "/about/legal-documents" },
    ],
  },
  {
    title: "SCHEMES",
    href: "/schemes",
    children: [
        { title: "MGNREGS", href: "/schemes/mgnregs" },
        { title: "PAMY-G", href: "/schemes/pamy-g" },
        { title: "NSAP", href: "/schemes/nsap" },
        { title: "NMP", href: "/schemes/nmp" },
        { title: "FFCG", href: "/schemes/ffcg" },
        { title: "DSJE", href: "/schemes/dsje" },
        { title: "OTHERS", href: "/schemes/others" },
    ]
  },
  {
    title: "CALENDAR",
    href: "/calendar",
     children: [
        { title: "MGNREGS", href: "/calendar/mgnregs" },
        { title: "PAMY-G", href: "/calendar/pamy-g" },
        { title: "NSAP", href: "/calendar/nsap" },
        { title: "NMP", href: "/calendar/nmp" },
        { title: "FFCG", href: "/calendar/ffcg" },
        { title: "DSJE", href: "/calendar/dsje" },
        { title: "OTHERS", href: "/calendar/others" },
    ]
  },
  { title: "GALLERY", href: "/gallery" },
  {
    title: "SA REPORTS",
    href: "/sa-reports",
    children: [
        { title: "Individual Social Audit Reports", href: "/sa-reports/individual" },
        { title: "Consolidated Reports", href: "/sa-reports/consolidated" },
        { title: "Annual Reports", href: "/sa-reports/annual" },
        { title: "Reports in MGNREGS website", href: "/sa-reports/mgnregs-reports" },
        { title: "Reports in MSJE website", href: "/sa-reports/msje-reports" },
    ]
  },
  {
    title: "LIBRARY",
    href: "/library",
    children: [
        { title: "Media", href: "/library/media" },
        { title: "Careers", href: "/library/careers" },
        { title: "Blog", href: "/library/blog" },
        { title: "RTI", href: "/library/rti" },
        { title: "Case Studies", href: "/library/case-studies" },
    ]
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
        { title: "PAMY-G", href: "/data-entry/pamy-g" },
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

export function MainNavigation() {
  const { isSignedIn } = useAuth();
  
  return (
    <nav className="bg-secondary w-full flex flex-col items-center py-2 shadow-md sticky top-[80px] z-40">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
        {guestMenuItems.map((item, index) => (
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
                        <DropdownMenuItem key={child.title} asChild>
                          <Link href={child.href}>{child.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="ghost" className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                      <Link href={item.href}>{item.title}</Link>
                  </Button>
                )}
                {index < guestMenuItems.length - 1 && (
                    <div className="h-4 w-px bg-primary/20" />
                )}
            </React.Fragment>
        ))}
      </div>
      
      {isSignedIn && (
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center mt-2">
            {signedInMenuItems.map((item, index) => (
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
                            <DropdownMenuItem key={child.title} asChild>
                              <Link href={child.href}>{child.title}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button asChild variant="ghost" className="text-primary hover:bg-accent font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2">
                          <Link href={item.href}>{item.title}</Link>
                      </Button>
                    )}
                    {index < signedInMenuItems.length - 1 && (
                        <div className="h-4 w-px bg-primary/20" />
                    )}
                </React.Fragment>
            ))}
        </div>
      )}
    </nav>
  );
}
