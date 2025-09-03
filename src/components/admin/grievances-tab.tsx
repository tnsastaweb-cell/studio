
'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Paperclip, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useGrievances, Grievance, GRIEVANCE_STATUSES } from '@/services/grievances';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const grievanceReplySchema = z.object({
    replyContent: z.string().min(10, "Reply must be at least 10 characters long."),
    status: z.enum(GRIEVANCE_STATUSES),
    attachment: z.any().optional(),
});
type GrievanceReplyValues = z.infer<typeof grievanceReplySchema>;

export function GrievancesTab() {
    const { user } = useAuth();
    const { grievances, addReply, updateGrievanceStatus, deleteGrievance } = useGrievances();
    const { toast } = useToast();
    const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
    const [replyingToGrievance, setReplyingToGrievance] = useState<Grievance | null>(null);
    const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
    
    const canManageGrievances = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const grievanceReplyForm = useForm<GrievanceReplyValues>({
        resolver: zodResolver(grievanceReplySchema),
    });

    const handleReplyGrievance = (grievance: Grievance) => {
        setReplyingToGrievance(grievance);
        grievanceReplyForm.reset({
            replyContent: grievance.reply?.content || '',
            status: grievance.status,
            attachment: undefined,
        });
        setIsReplyFormOpen(true);
    };

    const onGrievanceReplySubmit = (values: GrievanceReplyValues) => {
        if (!replyingToGrievance || !user) return;
        
        const processSubmit = (attachmentData?: Grievance['reply']['attachment']) => {
            addReply(replyingToGrievance.id, values.replyContent, user.name, attachmentData);
            updateGrievanceStatus(replyingToGrievance.id, values.status);

            toast({ title: "Reply Sent", description: "The reply has been submitted successfully." });
            setIsReplyFormOpen(false);
            setReplyingToGrievance(null);
            setReplyAttachment(null);
        };
        
        if (replyAttachment) {
            const reader = new FileReader();
            reader.readAsDataURL(replyAttachment);
            reader.onloadend = () => {
                const attachmentData = {
                    name: replyAttachment.name,
                    type: replyAttachment.type,
                    size: replyAttachment.size,
                    dataUrl: reader.result as string,
                };
                processSubmit(attachmentData);
            };
            reader.onerror = () => {
                 toast({ variant: "destructive", title: "File Read Error", description: "Could not process the attachment file."});
            }
        } else {
            processSubmit(replyingToGrievance.reply?.attachment);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grievance Management</CardTitle>
                <CardDescription>Review, reply to, and manage user-submitted grievances.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reg. No</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Attachments</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grievances.map(g => (
                                <TableRow key={g.id}>
                                    <TableCell className="font-mono text-xs">{g.regNo}</TableCell>
                                    <TableCell>{format(new Date(g.submittedAt), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-medium">{g.isAnonymous ? "Anonymous" : g.fromName}</TableCell>
                                    <TableCell>{g.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            g.status === 'Resolved' ? 'default' :
                                                g.status === 'Rejected' ? 'destructive' : 'secondary'
                                        }>{g.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {g.attachment && <Paperclip className="h-4 w-4 mx-auto" />}
                                        {g.reply?.attachment && <Paperclip className="h-4 w-4 mx-auto text-primary" />}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleReplyGrievance(g)}>
                                            <Edit className="mr-2 h-3 w-3" /> Reply
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={!canManageGrievances}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the grievance.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteGrievance(g.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Dialog open={isReplyFormOpen} onOpenChange={setIsReplyFormOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Reply to Grievance: {replyingToGrievance?.regNo}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                            <p><strong>From:</strong> {replyingToGrievance?.fromName}</p>
                            <p><strong>Subject:</strong> {replyingToGrievance?.subject}</p>
                            <Card>
                                <CardHeader><CardTitle>Grievance Content</CardTitle></CardHeader>
                                <CardContent className="whitespace-pre-wrap font-normal text-sm">{replyingToGrievance?.content}</CardContent>
                                {replyingToGrievance?.attachment && (
                                    <div className="p-4 border-t">
                                        <a href={replyingToGrievance.attachment.dataUrl} download={replyingToGrievance.attachment.name} className="text-primary hover:underline text-sm flex items-center gap-2">
                                            <Paperclip className="h-4 w-4" /> Download Attachment
                                        </a>
                                    </div>
                                )}
                            </Card>
                            <Form {...grievanceReplyForm}>
                                <form onSubmit={grievanceReplyForm.handleSubmit(onGrievanceReplySubmit)} className="space-y-4 pt-4">
                                    <FormField control={grievanceReplyForm.control} name="replyContent" render={({ field }) => (<FormItem><FormLabel>Your Reply</FormLabel><FormControl><Textarea placeholder="Type your reply here..." {...field} className="min-h-32" /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={grievanceReplyForm.control} name="attachment" render={({ field }) => (<FormItem><FormLabel>Attach File (Optional)</FormLabel><FormControl><Input type="file" onChange={(e) => { field.onChange(e.target.files); setReplyAttachment(e.target.files?.[0] || null); }} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={grievanceReplyForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Update Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent>{GRIEVANCE_STATUSES.map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={() => setIsReplyFormOpen(false)}>Cancel</Button>
                                        <Button type="submit">Submit Reply</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
