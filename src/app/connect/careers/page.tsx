
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Careers</CardTitle>
                <CardDescription>
                    Opportunities to join our team will be posted here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is currently under construction. Please check back later for updates.</p>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
