
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const dataEntryItems = [
    { title: "MGNREGS", href: "/data-entry/mgnregs" },
    { title: "PMAY-G", href: "/data-entry/pamy-g" },
    { title: "NSAP", href: "/data-entry/nsap" },
    { title: "NMP", href: "/data-entry/nmp" },
    { title: "15th CFC Grant", href: "/data-entry/ffcg" },
    { title: "DSJE", href: "/data-entry/dsje" },
    { title: "HLC", href: "/data-entry/hlc" },
    { title: "State/District Assembly", href: "/data-entry/assembly" },
];


export default function DataEntryHubPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Data Entry Hub</CardTitle>
                <CardDescription>
                    Select a module below to start entering data.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                {dataEntryItems.map(item => (
                    <Card key={item.title} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href={item.href}>Enter Data</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
