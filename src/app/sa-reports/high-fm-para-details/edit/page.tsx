
'use client';

// This is a placeholder file for the edit page.
// The actual implementation would be a large form component similar to the data entry pages.
// For now, it will just show the ID of the item to be edited.

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useMgnregs } from '@/services/mgnregs-data';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';


export default function EditHighFmParaDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { deleteMgnregsEntry } = useMgnregs();
    const { toast } = useToast();

    const entryId = searchParams.get('id');
    const issueNo = searchParams.get('issueNo');

    const canDelete = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleDelete = () => {
        if (!entryId) return;
        deleteMgnregsEntry(parseInt(entryId, 10));
        toast({
            title: "Entry Deleted",
            description: `The entry with issue no ${issueNo} has been removed.`,
        });
        router.push('/sa-reports/high-fm-para-details');
    }

    if (authLoading) {
        return <p>Loading...</p>;
    }

    return (
         <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit High FM Para Details</CardTitle>
                        <CardDescription>
                           This page is under construction. You are editing Entry ID: {entryId} and Issue No: {issueNo}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The detailed form for editing High FM Para details will be built here.</p>
                        {/* The full form as described in the user prompt would go here */}
                         <div className="flex justify-end gap-4 mt-8">
                             <Button variant="outline">Clear</Button>
                             <Button>Submit</Button>
                             {canDelete && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the entire entry associated with this issue.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                 </AlertDialog>
                             )}
                         </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    )
}
