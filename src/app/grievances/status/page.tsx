
'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGrievances, Grievance } from '@/services/grievances';
import { useToast } from '@/hooks/use-toast';
import { FileQuestion, Badge, Paperclip, ChevronLeft, Search as SearchIcon, Smile, Meh, Frown } from "lucide-react";
import { Label } from '@/components/ui/label';

const searchSchema = z.object({
  searchTerm: z.string().min(1, "Registration Number is required."),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const GrievanceDetails = ({ grievance, onFeedbackSubmit }: { grievance: Grievance, onFeedbackSubmit: (id: number, feedback: 'Satisfied' | 'Partially Satisfied' | 'Not Satisfied') => void }) => {
    return (
        <Card className="mt-8">
            <CardHeader>
                 <CardTitle className="flex justify-between items-start">
                    <span>Grievance Details</span>
                    <Badge variant={
                        grievance.status === 'Resolved' ? 'default' : 
                        grievance.status === 'Rejected' ? 'destructive' : 'secondary'
                    }>{grievance.status}</Badge>
                 </CardTitle>
                 <CardDescription>Registration No: {grievance.regNo}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-6 border rounded-lg space-y-4 bg-background">
                    <div className="flex justify-between">
                       <div className="text-sm">
                           <p className="font-semibold">From:</p>
                           <p>{grievance.fromName}</p>
                           <p>{grievance.fromAddress}</p>
                           <p>{grievance.district}, {grievance.pincode}</p>
                       </div>
                       <div className="text-sm text-right">
                            <p className="font-semibold">To:</p>
                            <p>The Director, SASTA</p>
                       </div>
                    </div>
                     <p><strong>Subject:</strong> {grievance.subject}</p>
                     <p className="whitespace-pre-wrap font-normal text-foreground/90 border-t pt-4">{grievance.content}</p>

                     {grievance.attachment && (
                         <div className="border-t pt-4">
                            <a href={grievance.attachment.dataUrl} download={grievance.attachment.name} className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <Paperclip className="h-4 w-4" /> View Attachment ({grievance.attachment.name})
                            </a>
                         </div>
                     )}
                     
                     <div className="flex justify-between items-end pt-8">
                        <div>
                            <p><strong>Date:</strong> {grievance.date}</p>
                            <p><strong>Place:</strong> {grievance.place}</p>
                        </div>
                        <div className="text-right">
                            <p>Sincerely,</p>
                            <p className="font-semibold">{grievance.sincerelyName}</p>
                        </div>
                     </div>
                </div>

                {grievance.reply && (
                     <div className="mt-6">
                        <h3 className="text-xl font-bold text-primary mb-2">Reply from Director's Office</h3>
                         <div className="p-6 border rounded-lg space-y-4 bg-green-50/50">
                            <p className="whitespace-pre-wrap font-normal text-foreground/90">{grievance.reply.content}</p>
                             {grievance.reply.attachment && (
                                <div className="border-t pt-4">
                                    <a href={grievance.reply.attachment.dataUrl} download={grievance.reply.attachment.name} className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <Paperclip className="h-4 w-4" /> View Reply Attachment ({grievance.reply.attachment.name})
                                    </a>
                                </div>
                             )}
                            <div className="text-right text-sm text-muted-foreground pt-4">
                                <p>Replied by: {grievance.reply.repliedBy}</p>
                                <p>{new Date(grievance.reply.repliedAt).toLocaleString()}</p>
                            </div>
                        </div>
                        {!grievance.petitionerFeedback ? (
                            <div className="mt-4 text-center p-4 border rounded-md">
                               <p className="font-semibold mb-2">Are you satisfied with the reply?</p>
                               <div className="flex justify-center gap-4">
                                 <Button variant="outline" size="sm" className="gap-2" onClick={() => onFeedbackSubmit(grievance.id, 'Satisfied')}><Smile className="h-4 w-4 text-green-500" /> Yes</Button>
                                 <Button variant="outline" size="sm" className="gap-2" onClick={() => onFeedbackSubmit(grievance.id, 'Partially Satisfied')}><Meh className="h-4 w-4 text-yellow-500" /> Partially</Button>
                                 <Button variant="outline" size="sm" className="gap-2" onClick={() => onFeedbackSubmit(grievance.id, 'Not Satisfied')}><Frown className="h-4 w-4 text-red-500" /> No</Button>
                               </div>
                            </div>
                        ) : (
                             <div className="mt-4 text-center p-4 border-2 border-dashed border-primary/50 rounded-md bg-muted/30">
                                <p className="font-semibold text-primary">Thank you for your feedback!</p>
                                <p className="text-sm text-muted-foreground">You rated this reply as: <strong>{grievance.petitionerFeedback}</strong></p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function CheckGrievanceStatusPage() {
    const { grievances, addPetitionerFeedback } = useGrievances();
    const [foundGrievance, setFoundGrievance] = useState<Grievance | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { toast } = useToast();

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            searchTerm: "",
        },
    });

    const onSubmit = (data: SearchFormValues) => {
        let result = grievances.find(g => g.regNo.toLowerCase() === data.searchTerm.toLowerCase());
        
        setFoundGrievance(result || null);
        setSearchPerformed(true);

        if (!result) {
            toast({
                variant: 'destructive',
                title: "Not Found",
                description: "No grievance found with the provided Registration Number.",
            });
        }
    };
    
    const handleFeedbackSubmit = (id: number, feedback: 'Satisfied' | 'Partially Satisfied' | 'Not Satisfied') => {
        addPetitionerFeedback(id, feedback);
        toast({
            title: "Feedback Submitted",
            description: "Thank you for your valuable feedback."
        });
        // Refresh the displayed grievance to show the change
        const updatedGrievance = grievances.find(g => g.id === id);
        if (updatedGrievance) {
            setFoundGrievance(updatedGrievance);
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader className="flex flex-row justify-between items-center border-b">
                 <div>
                    <CardTitle>View Grievance Status</CardTitle>
                 </div>
                <Button variant="outline" asChild>
                    <Link href="/grievances"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Grievance Options</Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <Card className="max-w-xl mx-auto p-6 bg-card border-none shadow-none">
                             <div className="grid grid-cols-1 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name="searchTerm"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registration Number (e.g., GRV-XXXXXX)</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter your GRV Number..." 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <Button type="submit" className="bg-primary/90 hover:bg-primary text-primary-foreground">
                                                <SearchIcon className="mr-2 h-4 w-4" />
                                                Search
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                             </div>
                         </Card>
                    </form>
                </Form>

                {searchPerformed && foundGrievance && (
                    <GrievanceDetails grievance={foundGrievance} onFeedbackSubmit={handleFeedbackSubmit} />
                )}
                 {searchPerformed && !foundGrievance && (
                    <div className="mt-8 text-center">
                        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Grievance Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Please check your Registration Number and try again.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
