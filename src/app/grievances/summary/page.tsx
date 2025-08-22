
'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGrievances } from '@/services/grievances';
import { format } from 'date-fns';
import { Paperclip, Loader2 } from 'lucide-react';


export default function GrievanceSummaryPage() {
    const { grievances, loading } = useGrievances();

    const truncateText = (text: string, length: number) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Grievance Summary</CardTitle>
                        <CardDescription>
                            An overview of all submitted grievances and their current status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="border rounded-lg">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">S.No</TableHead>
                                        <TableHead>Reg. No</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Snippet</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Attachment</TableHead>
                                        <TableHead>Reply</TableHead>
                                    </TableRow>
                                </TableHeader>
                             <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                <span>Loading Grievances...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : grievances.length > 0 ? (
                                    grievances.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.regNo}</TableCell>
                                            <TableCell>{format(new Date(item.submittedAt), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="font-medium">{item.isAnonymous ? "Anonymous" : item.fromName}</TableCell>
                                            <TableCell>{truncateText(item.subject, 30)}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-xs">{truncateText(item.content, 50)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    item.status === 'Resolved' ? 'default' : 
                                                    item.status === 'Rejected' ? 'destructive' : 'secondary'
                                                }>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{item.attachment && <Paperclip className="h-4 w-4 mx-auto" />}</TableCell>
                                            <TableCell className="text-center">{item.reply && <Paperclip className="h-4 w-4 mx-auto" />}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                             No grievances have been submitted yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                           </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

