import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, BellRing } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollingAnnouncementBar } from "@/components/scrolling-announcement-bar";
import { Header } from "@/components/header";
import { MainNavigation } from "@/components/main-navigation";
import { Footer } from "@/components/footer";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollingAnnouncementBar />
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for products, brands and more"
                className="pl-10 w-full text-base bg-white"
              />
            </div>
            
            <section>
              <h2 className="text-3xl font-bold text-primary mb-6">Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  { src: "https://placehold.co/600x400.png", hint: "men fashion", title: "Men's Casual Shirt" },
                  { src: "https://placehold.co/600x400.png", hint: "women dress", title: "Women's Summer Dress" },
                  { src: "https://placehold.co/600x400.png", hint: "kid toy", title: "Wooden Blocks Set" },
                  { src: "https://placehold.co/600x400.png", hint: "home decor", title: "Ceramic Vase" },
                  { src: "https://placehold.co/600x400.png", hint: "skincare product", title: "Organic Face Cream" },
                  { src: "https://placehold.co/600x400.png", hint: "running shoes", title: "Unisex Sport Sneakers" },
                ].map((item, index) => (
                  <Card key={index} className="overflow-hidden bg-card hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0">
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                        data-ai-hint={item.hint}
                      />
                    </CardContent>
                    <CardFooter className="p-4 bg-secondary">
                      <h3 className="font-bold text-primary">{item.title}</h3>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          </div>
          
          <aside className="space-y-8">
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
          </aside>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
