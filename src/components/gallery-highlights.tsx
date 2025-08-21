
"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { useGallery } from '@/services/gallery';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { galleryActivityTypes } from '@/services/gallery';

const chunkArray = (array: any[], size: number) => {
  if (!array || array.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};


export function GalleryHighlights() {
  const { items, loading } = useGallery();
  const plugin = React.useRef(
    Autoplay({ delay: 60000, stopOnInteraction: true })
  );

  const galleryItems = galleryActivityTypes.map(activity => {
      const photosForActivity = items.filter(item => item.activityType === activity && item.mediaType === 'photo');
      return {
          title: activity,
          imageUrl: photosForActivity.length > 0 ? photosForActivity[0].dataUrl : `https://placehold.co/600x400.png`,
          hint: activity.toLowerCase().split(' ').slice(0, 2).join(' '),
          data: photosForActivity.length > 0 ? photosForActivity[0] : null
      }
  });

  const imageBatches = chunkArray(galleryItems, 8);

  return (
    <section>
      <h2 className="text-3xl font-bold text-primary mb-6">GALLERY HIGHLIGHTS</h2>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {imageBatches.map((batch, batchIndex) => (
            <CarouselItem key={batchIndex}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {batch.map((item) => {
                  return (
                    <Dialog key={item.title}>
                      <DialogTrigger asChild>
                        <Card className="overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                          <CardContent className="p-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              width={600}
                              height={400}
                              className="w-full h-48 object-cover"
                              data-ai-hint={item.hint}
                            />
                          </CardContent>
                          <CardFooter className="p-3 bg-secondary">
                            <h3 className="font-bold text-primary text-sm text-center w-full">{item.title}</h3>
                          </CardFooter>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0">
                          <DialogHeader className="sr-only">
                              <DialogTitle>{item.title}</DialogTitle>
                              <DialogDescription>
                                A larger view of the gallery image for {item.title}.
                              </DialogDescription>
                          </DialogHeader>
                         <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-contain rounded-lg"
                            data-ai-hint={item.hint}
                          />
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </section>
  );
}
