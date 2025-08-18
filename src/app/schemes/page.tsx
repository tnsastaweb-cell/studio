
'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

const schemes = [
    { id: "mgnregs", name: "MGNREGS", href: "/schemes/mgnregs", description: "Mahatma Gandhi National Rural Employment Guarantee Scheme" },
    { id: "pmay-g", name: "PMAY-G", href: "/schemes/pamy-g", description: "Pradhan Mantri Awas Yojana (Gramin)" },
    { id: "15th-cfc", name: "15th CFC Grant", href: "/schemes/15th-cfc-grant", description: "15th Central Finance Commission Grants" },
    { id: "nmp", name: "NMP", href: "/schemes/nmp", description: "Puratchi Thalaivar MGR Nutritious Meal Programme" },
    { id: "dsje", name: "DSJE", href: "/schemes/dsje", description: "Social Justice - Grant-in-Aid (GIA) Institutions" },
];

export default function SchemesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>List of schemes being audited</CardTitle>
                <CardDescription>
                    Select a scheme to view more details about its Social Audit process.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={schemes[0].id} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                        {schemes.map(scheme => (
                           <TabsTrigger key={scheme.id} value={scheme.id}>{scheme.name}</TabsTrigger>
                        ))}
                    </TabsList>
                     {schemes.map(scheme => (
                        <TabsContent key={scheme.id} value={scheme.id}>
                            <Card className="border-t-0 rounded-t-none">
                                <CardHeader>
                                    <CardTitle className="text-xl text-primary">{scheme.description}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4">
                                        You are viewing the tab for the {scheme.description}. Click the button below to see the full details.
                                    </p>
                                     <Button asChild>
                                        <Link href={scheme.href}>Go to {scheme.name} Page</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
