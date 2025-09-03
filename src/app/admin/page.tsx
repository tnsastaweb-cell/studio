
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagementTab } from '@/components/admin/user-management-tab';
import { RolesTab } from '@/components/admin/roles-tab';
import { SchemesTab } from '@/components/admin/schemes-tab';
import { LocalBodiesTab } from '@/components/admin/local-bodies-tab';
import { GrievancesTab } from '@/components/admin/grievances-tab';
import { FeedbacksTab } from '@/components/admin/feedbacks-tab';
import { DetailsTab } from '@/components/admin/details-tab';
import { HlcDetailsTab } from '@/components/admin/hlc-details-tab';
import { SmarsTab } from '@/components/admin/s-mars-tab';
import { SiteSettingsTab } from '@/components/admin/site-settings-tab';


export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <MainNavigation />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const canAccessAdminPanel = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  if (!canAccessAdminPanel) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <MainNavigation />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-4">You do not have permission to view this page.</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Panel - Master Data</h1>
            <Button asChild>
                <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
        </div>
        
        <Tabs defaultValue="signup-details" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="signup-details">Sign Up Details</TabsTrigger>
            <TabsTrigger value="schemes">Schemes</TabsTrigger>
            <TabsTrigger value="local-bodies">Rural &amp; Urban</TabsTrigger>
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="hlc-details">HLC Details</TabsTrigger>
            <TabsTrigger value="s-mars">S-MARS</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="roles"><RolesTab /></TabsContent>
          <TabsContent value="signup-details"><UserManagementTab /></TabsContent>
          <TabsContent value="schemes"><SchemesTab /></TabsContent>
          <TabsContent value="local-bodies"><LocalBodiesTab /></TabsContent>
          <TabsContent value="grievances"><GrievancesTab /></TabsContent>
          <TabsContent value="feedbacks"><FeedbacksTab /></TabsContent>
          <TabsContent value="details"><DetailsTab /></TabsContent>
          <TabsContent value="hlc-details"><HlcDetailsTab /></TabsContent>
          <TabsContent value="s-mars"><SmarsTab /></TabsContent>
          <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
