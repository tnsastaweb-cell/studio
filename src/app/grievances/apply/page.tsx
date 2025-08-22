
'use client';

import React, { useState, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useGrievances, Grievance } from '@/services/grievances';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Paperclip } from "lucide-react";
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
} from "@/components/ui/alert-dialog";


const grievanceSchema = z.object({
  fromName: z.string().min(1, "From field is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Letter content is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  sincerelyName: z.string().min(1, "'Your Name' for signature is required"),
  contactNumber: z.string(),
  aadhaarNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),
  attachment: z.any().optional(),
}).refine(data => {
    // If one of the contact fields is filled, all must be.
    if(data.contactNumber || data.email) {
        return !!data.contactNumber && !!data.email;
    }
    return true;
}, { message: "Contact Number and Email are required for non-anonymous submissions.", path: ['contactNumber'] });

type GrievanceFormValues = z.infer<typeof grievanceSchema>;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_FORMATS = ".zip,.rar,.docx,.xlsx,.jpg,.png,.mp4,.mp3,.pdf";


export default function ApplyGrievancePage() {
    const { addGrievance } = useGrievances();
    const { toast } = useToast();
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<GrievanceFormValues>({
        resolver: zodResolver(grievanceSchema),
        defaultValues: {
            fromName: "",
            subject: "",
            content: "",
            date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
            place: "",
            sincerelyName: "",
            contactNumber: "",
            aadhaarNumber: "",
            email: "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            toast({
                variant: 'destructive',
                title: "File Too Large",
                description: `The file must be 20MB or smaller.`
            });
            if(fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setFile(selectedFile);
    };

    const onSubmit = (data: GrievanceFormValues) => {
        setIsSubmitting(true);
        
        const processSubmit = (attachmentData?: Grievance['attachment']) => {
            const isSubmitAnonymous = !data.contactNumber || !data.email;
            const newGrievance = addGrievance({ ...data, isAnonymous: isSubmitAnonymous, attachment: attachmentData });
            
            toast({
                title: "Submission Successful!",
                description: `Your grievance has been registered with number: ${newGrievance.regNo}`
            });

            form.reset();
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setIsSubmitting(false);
        }
        
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                const attachmentData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: reader.result as string,
                };
                processSubmit(attachmentData);
            };
            reader.onerror = () => {
                toast({ variant: "destructive", title: "File Read Error", description: "Could not process the attachment file."});
                setIsSubmitting(false);
            }
        } else {
             processSubmit();
        }
    };
    
    const onFormTrigger = () => {
        const contactNumber = form.getValues('contactNumber');
        const email = form.getValues('email');
        if (!contactNumber && !email) {
            setIsAnonymous(true);
        } else {
            setIsAnonymous(false);
            form.trigger().then(isValid => {
                if (isValid) {
                     document.getElementById('submit-trigger')?.click();
                }
            })
        }
    }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Apply for Grievance</CardTitle>
                <CardDescription>
                    Please fill out the form below in a formal letter format to submit your grievance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Letter Format Section */}
                        <div className="p-6 border rounded-lg space-y-4 bg-white">
                             <FormField control={form.control} name="fromName" render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-4">
                                        <FormLabel className="w-20 text-right">From:</FormLabel>
                                        <FormControl><Input placeholder="Name of Petitioner" {...field} /></FormControl>
                                    </div>
                                    <FormMessage className="pl-24" />
                                </FormItem>
                             )} />
                             <div className="flex items-center gap-4">
                                <Label className="w-20 text-right">To:</Label>
                                <p className="font-medium text-foreground/90">The Director, Social Audit Society of Tamil Nadu</p>
                             </div>
                              <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-4">
                                        <FormLabel className="w-20 text-right">Subject:</FormLabel>
                                        <FormControl><Input placeholder="Subject of your grievance" {...field} /></FormControl>
                                    </div>
                                    <FormMessage className="pl-24"/>
                                </FormItem>
                             )} />
                             <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content:</FormLabel>
                                    <FormControl><Textarea placeholder="Full letter body..." className="min-h-48" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />

                            <div className="flex justify-between items-end pt-8">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="date" render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel className="w-14">Date:</FormLabel>
                                                <FormControl><Input type="date" className="w-fit" {...field} /></FormControl>
                                            </div>
                                             <FormMessage className="pl-16"/>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="place" render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel className="w-14">Place:</FormLabel>
                                                <FormControl><Input placeholder="Your Place" className="w-fit" {...field} /></FormControl>
                                            </div>
                                             <FormMessage className="pl-16" />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="text-right">
                                    <p>Sincerely,</p>
                                     <FormField control={form.control} name="sincerelyName" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Your Name" className="w-48 mt-1 border-0 border-b rounded-none focus-visible:ring-0 text-center font-semibold" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Personal Details & Attachment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Card>
                                <CardHeader><CardTitle>Petitioner Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                                     )} />
                                     <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Aadhaar Number (Optional)</FormLabel><FormControl><Input placeholder="12-digit Aadhaar number" {...field} /></FormControl><FormMessage /></FormItem>
                                     )} />
                                     <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email ID</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                     )} />
                                </CardContent>
                           </Card>
                            <Card>
                                <CardHeader><CardTitle>Attachments (Optional)</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField control={form.control} name="attachment" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Attach File</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="file" 
                                                    ref={fileInputRef}
                                                    accept={SUPPORTED_FORMATS}
                                                    onChange={handleFileChange}
                                                />
                                            </FormControl>
                                            <FormDescription>Max size: 20MB. Supported formats: {SUPPORTED_FORMATS}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                     {file && (
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                                            <Paperclip className="h-4 w-4" />
                                            <span className="font-medium">{file.name}</span>
                                            <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                     )}
                                </CardContent>
                           </Card>
                        </div>
                        
                        <div className="flex justify-end gap-4">
                           <Button type="button" variant="outline">Save as Draft</Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button type="button" onClick={onFormTrigger} id="form-trigger">Submit</Button>
                              </AlertDialogTrigger>
                              {/* Regular Submission Dialog */}
                                <AlertDialogContent id="submit-dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to submit this grievance? Please review all details before proceeding.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                               {isAnonymous && (
                                <AlertDialogContent id="anonymous-dialog">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> Anonymous Submission Warning</AlertDialogTitle>
                                        <AlertDialogDescription>You have not provided a Contact Number or Email. This submission will be treated as junk/spam, and **no reply will be sent**. Are you sure you want to proceed?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                             {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                               )}
                           </AlertDialog>
                           {/* Hidden trigger for programatic open */}
                           <AlertDialogTrigger asChild>
                             <button id="submit-trigger" className="hidden"></button>
                           </AlertDialogTrigger>

                        </div>
                     </form>
                </Form>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
