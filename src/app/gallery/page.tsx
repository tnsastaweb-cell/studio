
'use client';

import React from 'react';
import { useGallery, GalleryItem } from '@/services/gallery';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Video, Newspaper, BookOpen } from 'lucide-react';


function GalleryGrid({ items }: { items: GalleryItem[] }) {
    if (items.length === 0) {
        return <p className="text-muted-foreground text-center col-span-full">No items to display in this category yet.</p>;
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


export default function GalleryPage() {
    const { items: galleryItems, loading } = useGallery();

    const photos = galleryItems.filter(item => item.mediaType === 'photo');
    const videos = galleryItems.filter(item => item.mediaType === 'video');
    const newsReports = galleryItems.filter(item => item.mediaType === 'news');
    const blogs = galleryItems.filter(item => item.mediaType === 'blog');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>
                    Browse photos, videos, and reports from our social audit activities across various regions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="photos" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="photos">Photos</TabsTrigger>
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                        <TabsTrigger value="news">News Reports</TabsTrigger>
                        <TabsTrigger value="blogs">Blog</TabsTrigger>
                    </TabsList>
                    <TabsContent value="photos" className="pt-6">
                        <GalleryGrid items={photos} />
                    </TabsContent>
                    <TabsContent value="videos" className="pt-6">
                        <GalleryGrid items={videos} />
                    </TabsContent>
                    <TabsContent value="news" className="pt-6">
                        <GalleryGrid items={newsReports} />
                    </TabsContent>
                    <TabsContent value="blogs" className="pt-6">
                       <GalleryGrid items={blogs} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
