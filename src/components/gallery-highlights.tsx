
"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

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
  DialogTrigger,
} from "@/components/ui/dialog";

const galleryItems = [
  { title: "Orientation Meeting", hint: "meeting presentation" },
  { title: "Habitation Meeting", hint: "community meeting" },
  { title: "Record Verification", hint: "documents records" },
  { title: "Door to Door Visit", hint: "community outreach" },
  { title: "Community Engagement", hint: "people talking" },
  { title: "Report Preparation", hint: "writing report" },
  { title: "Special Grama Sabha", hint: "village assembly" },
  { title: "Social Justice Program", hint: "social justice" },
  { title: "Noon Meals Program", hint: "school lunch" },
  { title: "Training", hint: "training session" },
  { title: "HLC Meeting", hint: "formal meeting" },
  { title: "Team Visit", hint: "team discussion" },
  { title: "Beneficiary Sabha", hint: "public meeting" },
  { title: "District Assembly", hint: "government meeting" },
  { title: "State Assembly", hint: "official assembly" },
  { title: "Others", hint: "miscellaneous event" },
];

const chunkArray = (array: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const imageBatches = chunkArray(galleryItems, 8);

export function GalleryHighlights() {
  const plugin = React.useRef(
    Autoplay({ delay: 60000, stopOnInteraction: true })
  );

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
                {batch.map((item, itemIndex) => {
                  const imageUrl = `https://placehold.co/600x400.png`;
                  return (
                    <Dialog key={item.title}>
                      <DialogTrigger asChild>
                        <Card className="overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                          <CardContent className="p-0">
                            <Image
                              src={imageUrl}
                              alt={item.title}
                              width={600}
                              height={400}
                              className="w-full h-auto object-cover"
                              data-ai-hint={item.hint}
                            />
                          </CardContent>
                          <CardFooter className="p-3 bg-secondary">
                            <h3 className="font-bold text-primary text-sm text-center w-full">{item.title}</h3>
                          </CardFooter>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0">
                         <Image
                            src={imageUrl}
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
