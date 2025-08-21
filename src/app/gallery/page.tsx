
'use client';

import React, { useState, useMemo } from 'react';
import { useGallery, GalleryItem, GalleryMediaType } from '@/services/gallery';
import Image from 'next/image';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOCK_SCHEMES } from '@/services/schemes';
import { Camera, Video, Newspaper, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

function GalleryGrid({ items }: { items: GalleryItem[] }) {
    if (items.length === 0) {
        return <p className="text-muted-foreground text-center col-span-full pt-8">No items to display in this category.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
                <Dialog key={item.id}>
                    <DialogTrigger asChild>
                        <Card className="overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                            <CardContent className="p-0">
                                {item.mediaType === 'photo' ? (
                                    <Image
                                        src={item.dataUrl}
                                        alt={item.activityType}
                                        width={600}
                                        height={400}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                                       {item.mediaType === 'video' && <Video className="h-16 w-16 text-muted-foreground" />}
                                       {item.mediaType === 'news' && <Newspaper className="h-16 w-16 text-muted-foreground" />}
                                       {item.mediaType === 'blog' && <BookOpen className="h-16 w-16 text-muted-foreground" />}
                                    </div>
                                )}
                            </CardContent>
                             <div className="p-4">
                                <p className="font-bold text-primary">{item.activityType}</p>
                                <p className="text-sm text-muted-foreground">{item.panchayatName}, {item.blockName}</p>
                                <p className="text-xs text-muted-foreground/80 pt-1">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                             </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0">
                         <DialogTitle className="sr-only">{item.activityType}</DialogTitle>
                        {item.mediaType === 'photo' ? (
                             <Image
                                src={item.dataUrl}
                                alt={item.activityType}
                                width={1200}
                                height={800}
                                className="w-full h-auto object-contain rounded-lg"
                              />
                        ) : (
                             <div className="p-8">
                                <h2 className="text-2xl font-bold mb-4">{item.activityType}</h2>
                                <p><strong>Filename:</strong> {item.originalFilename}</p>
                                <p>This is a non-photo item. Viewing options for videos, news reports, and blogs will be enhanced in a future update.</p>
                             </div>
                        )}
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    );
}


export default function GalleryPage({ mediaType }: { mediaType: GalleryMediaType }) {
    const { items: galleryItems, loading } = useGallery();
    const pathname = usePathname();

    const mediaTypeLinks = [
        { name: 'Photos', href: '/gallery/photos' },
        { name: 'Videos', href: '/gallery/videos' },
        { name: 'News Reports', href: '/gallery/news-reports' },
        { name: 'Blogs', href: '/gallery/blog' },
    ];
    
    const schemesForTabs = [{ id: 'all', name: 'All Schemes' }, ...MOCK_SCHEMES];

    const filteredByMediaType = useMemo(() => {
        return galleryItems.filter(item => item.mediaType === mediaType);
    }, [galleryItems, mediaType]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>
                    Browse photos, videos, and reports from our social audit activities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 border-b">
                    <nav className="flex space-x-1 -mb-px">
                        {mediaTypeLinks.map(link => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className={cn(
                                    "py-2 px-4 inline-flex items-center gap-2 -mb-px text-sm font-medium text-center border rounded-t-lg",
                                    pathname === link.href 
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'text-gray-500 bg-transparent border-transparent hover:text-primary hover:border-gray-300'
                                )}>
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                 <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                         {schemesForTabs.map(scheme => (
                           <TabsTrigger key={scheme.id} value={scheme.name}>{scheme.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : (
                    <>
                        {schemesForTabs.map(scheme => (
                            <TabsContent key={scheme.id} value={scheme.name} className="pt-6">
                                <GalleryGrid items={
                                    scheme.name === 'All Schemes' 
                                    ? filteredByMediaType 
                                    : filteredByMediaType.filter(item => item.scheme === scheme.name)
                                } />
                            </TabsContent>
                        ))}
                    </>
                    )}
                </Tabs>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
