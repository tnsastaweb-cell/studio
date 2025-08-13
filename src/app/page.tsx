
"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, BellRing } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollingAnnouncementBar } from "@/components/scrolling-announcement-bar";
import { Header } from "@/components/header";
import { MainNavigation } from "@/components/main-navigation";
import { Footer } from "@/components/footer";
import { BottomNavigation } from "@/components/bottom-navigation";
import { GalleryHighlights } from "@/components/gallery-highlights";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);

  const whatsNewItems = [
    {
      title: "Urgent Actions for Today",
      content: "Details about urgent actions go here.",
    },
    {
      title: "This Week's Key Priorities",
      content: "Details about this week's key priorities go here.",
    },
    {
      title: "Upcoming Month's Focus",
      content: "Details about the upcoming month's focus go here.",
    },
    {
      title: "Recent Changes & Updates",
      content: "Details about recent changes and updates go here.",
    },
    {
      title: "Important Notes & Reminders",
      content: "Details about important notes and reminders go here.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollingAnnouncementBar />
      <Header />
      <MainNavigation isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for menus"
                className="pl-10 w-full text-base bg-white"
              />
            </div>
            
            <GalleryHighlights />

            {isSignedIn && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BellRing className="h-5 w-5" />
                    <span>WHAT'S NEW?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {whatsNewItems.map((item) => (
                      <AccordionItem value={item.title} key={item.title}>
                        <AccordionTrigger className="font-semibold text-base">{item.title}</AccordionTrigger>
                        <AccordionContent className="font-normal text-foreground/90 pl-2">
                          {item.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
          
          <aside className="space-y-8 lg:col-span-1">
          </aside>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
