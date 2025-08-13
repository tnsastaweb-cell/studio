
"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, BellRing, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollingAnnouncementBar } from "@/components/scrolling-announcement-bar";
import { Header } from "@/components/header";
import { MainNavigation } from "@/components/main-navigation";
import { Footer } from "@/components/footer";
import { BottomNavigation } from "@/components/bottom-navigation";
import { GalleryHighlights } from "@/components/gallery-highlights";

export default function Home() {
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);

  const whatsNewItems = [
    { title: "Urgent Actions for Today" },
    { title: "This Week's Key Priorities" },
    { title: "Upcoming Month's Focus" },
    { title: "Recent Changes & Updates" },
    { title: "Important Notes & Reminders" },
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
                    <Star className="h-5 w-5" />
                    <span>WHAT'S NEW?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc list-inside text-sm font-normal text-foreground/90 space-y-1">
                    {whatsNewItems.map((item) => (
                      <li key={item.title}>{item.title}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          <aside className="space-y-8 lg:col-span-1">
            {!isSignedIn && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BellRing className="h-5 w-5" />
                    <span>Important Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-accent bg-background">
                    <AlertTitle className="font-bold">Seasonal Sale is Live!</AlertTitle>
                    <AlertDescription>
                      Get up to 70% off on selected items. Limited time offer.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-accent bg-background">
                    <AlertTitle className="font-bold">New Return Policy</AlertTitle>
                    <AlertDescription>
                      We've updated our return policy for a hassle-free experience.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
