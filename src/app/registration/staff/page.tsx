
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StaffRegistrationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Staff Registration</CardTitle>
                <CardDescription>
                    This page is ready for new content.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Staff registration form will be built here.</p>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
