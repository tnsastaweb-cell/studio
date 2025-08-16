
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { OrganizationalChart } from '@/components/organizational-chart';

export default function OrganizationalStructurePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Organizational Structure</h1>
            <p className="text-lg text-muted-foreground">The flowchart below illustrates the structure of the Social Audit Unit.</p>
        </div>
        <OrganizationalChart />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
