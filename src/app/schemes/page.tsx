
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MgnregsSchemeContent } from '@/app/schemes/mgnregs/page';
import { PmaygSchemeContent } from '@/app/schemes/pamy-g/page';
import { CfcGrantSchemeContent } from '@/app/schemes/15th-cfc-grant/page';
import { NmpSchemeContent } from '@/app/schemes/nmp/page';
import { DsjeSchemeContent } from '@/app/schemes/dsje/page';


const schemes = [
    { id: "mgnregs", name: "MGNREGS", Component: MgnregsSchemeContent },
    { id: "pmay-g", name: "PMAY-G", Component: PmaygSchemeContent },
    { id: "15th-cfc", name: "15th CFC Grant", Component: CfcGrantSchemeContent },
    { id: "nmp", name: "NMP", Component: NmpSchemeContent },
    { id: "dsje", name: "DSJE", Component: DsjeSchemeContent },
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
                        <TabsContent key={scheme.id} value={scheme.id} className="pt-4">
                            <scheme.Component />
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
