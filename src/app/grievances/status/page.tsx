
'use client';

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { FileQuestion, Badge, Paperclip } from "lucide-react";
import { Label } from '@/components/ui/label';


const searchSchema = z.object({
  searchType: z.enum(['regNo', 'aadhaarNo']),
  searchTerm: z.string().min(1, "Search term is required."),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const GrievanceDetails = ({ grievance }: { grievance: Grievance }) => {
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function CheckGrievanceStatusPage() {
    const { grievances } = useGrievances();
    const [foundGrievances, setFoundGrievances] = useState<Grievance[]>([]);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { toast } = useToast();

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            searchType: 'regNo',
            searchTerm: "",
        },
    });

    const onSubmit = (data: SearchFormValues) => {
        let results: Grievance[] = [];
        if (data.searchType === 'regNo') {
            results = grievances.filter(g => g.regNo === data.searchTerm);
        } else {
            results = grievances.filter(g => g.aadhaarNumber === data.searchTerm);
        }
        
        setFoundGrievances(results);
        setSearchPerformed(true);

        if (results.length === 0) {
            toast({
                variant: 'destructive',
                title: "Not Found",
                description: "No grievance found with the provided details.",
            });
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Check Grievance Status</CardTitle>
                <CardDescription>
                    Enter your Grievance Registration Number or Aadhaar Number to check the status.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
                         <FormField control={form.control} name="searchType" render={({ field }) => (
                           <FormItem className="space-y-2">
                                <FormControl>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <input type="radio" value="regNo" checked={field.value === 'regNo'} onChange={field.onChange} id="regNo" />
                                            <Label htmlFor="regNo">Registration Number</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="radio" value="aadhaarNo" checked={field.value === 'aadhaarNo'} onChange={field.onChange} id="aadhaarNo" />
                                            <Label htmlFor="aadhaarNo">Aadhaar Number</Label>
                                        </div>
                                    </div>
                                </FormControl>
                           </FormItem>
                         )} />
                        
                         <FormField control={form.control} name="searchTerm" render={({ field }) => (
                           <FormItem><FormLabel className="sr-only">Search Term</FormLabel><FormControl><Input placeholder="Enter your number..." {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         
                         <div className="flex justify-end">
                            <Button type="submit">Search</Button>
                         </div>
                    </form>
                </Form>

                {searchPerformed && foundGrievances.length > 0 && (
                    <div className="mt-8 space-y-6">
                        {foundGrievances.map(grievance => (
                           <GrievanceDetails key={grievance.id} grievance={grievance} />
                        ))}
                    </div>
                )}
                 {searchPerformed && foundGrievances.length === 0 && (
                    <div className="mt-8 text-center">
                        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Grievances Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Please check your details and try again.</p>
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
