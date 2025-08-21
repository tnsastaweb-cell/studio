
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GrievancesHubPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Grievances Hub</CardTitle>
                <CardDescription>
                    Manage and track grievances. Choose an option below to proceed.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Apply for Grievance</CardTitle>
                        <CardDescription>Submit a new grievance for review.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/grievances/apply">Apply Now</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Check Grievance Status</CardTitle>
                        <CardDescription>Check the status of a previously submitted grievance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/grievances/status">Check Status</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Grievance Summary</CardTitle>
                        <CardDescription>View a summary of all grievances.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                           <Link href="/grievances/summary">View Summary</Link>
                        </Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
