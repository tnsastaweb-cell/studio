
'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFeedback } from '@/services/feedback';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function FeedbacksTab() {
    const { user } = useAuth();
    const { feedbacks, deleteFeedback } = useFeedback();
    const { toast } = useToast();

    const canManageFeedbacks = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleDeleteFeedback = (feedbackId: number) => {
        deleteFeedback(feedbackId);
        toast({ title: "Feedback Deleted", description: "The feedback has been removed." });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Feedbacks</CardTitle>
                <CardDescription>List of all submitted feedbacks from users. Total: {feedbacks.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>S.No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedbacks.map((feedback, index) => (
                                <TableRow key={feedback.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{feedback.name}</TableCell>
                                    <TableCell>{feedback.email}</TableCell>
                                    <TableCell><Badge variant="outline">{feedback.type}</Badge></TableCell>
                                    <TableCell className="text-left whitespace-pre-wrap text-foreground/80 font-normal">{feedback.feedback}</TableCell>
                                    <TableCell>{format(new Date(feedback.submittedAt), 'dd/MM/yyyy hh:mm a')}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={!canManageFeedbacks}>Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this feedback.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteFeedback(feedback.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
