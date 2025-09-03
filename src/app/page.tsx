
"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isSignedIn } = useAuth();

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
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
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
            <CardHeader className="bg-primary rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-primary-foreground">
                <BellRing className="h-5 w-5" />
                <span>WHAT'S NEW?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-card">
              <Accordion type="single" collapsible className="w-full bg-white rounded-md p-4 border">
                {whatsNewItems.map((item, index) => (
                  <AccordionItem value={item.title} key={item.title} className={cn(index === whatsNewItems.length - 1 && "border-b-0")}>
                    <AccordionTrigger className="font-semibold text-base text-primary hover:no-underline">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="font-normal text-foreground/90 pl-2 pt-2">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
      <div id="bhashini-embed" data-user-id="88813755-4048-4720-8a22-acb83b341f7e" data-primary-color="#000" style={{height:'0px'}}></div>
      <BottomNavigation />
    </div>
  );
}
