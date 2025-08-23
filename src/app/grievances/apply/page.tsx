
'use client';

import React, { useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';
import { ChevronLeft, Paperclip, AlertCircle, Mic } from "lucide-react";

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useGrievances, Grievance } from '@/services/grievances';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DISTRICTS } from '@/services/district-offices';


const grievanceSchema = z.object({
  fromName: z.string().min(1, "Name is required"),
  fromAddress: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(10, "Grievance content must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  sincerelyName: z.string().min(1, "'Your Name' for signature is required"),
  contactNumber: z.string(),
  aadhaarNumber: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  attachment: z.any().optional(),
}).refine(data => {
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
            fromAddress: "",
            district: undefined,
            pincode: "",
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
                     document.getElementById('submit-trigger-button')?.click();
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
            <CardHeader className="flex flex-row justify-between items-center border-b">
                 <div>
                    <CardTitle>Submit Grievance</CardTitle>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/grievances"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Grievance Options</Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="p-6 border rounded-lg space-y-4 bg-white shadow-inner">
                            <div className="space-y-4">
                                <FormLabel>From:</FormLabel>
                                <FormField control={form.control} name="fromName" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Your Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="fromAddress" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Your Full Address" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="district" render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Your District" /></SelectTrigger></FormControl>
                                                <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="pincode" render={({ field }) => (
                                        <FormItem><FormControl><Input placeholder="Your Pin Code" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <FormLabel>To:</FormLabel>
                                <Textarea readOnly disabled value="The Director,&#10;Social Audit Society of Tamil Nadu (SASTA),&#10;Panagal Maligai, Saidapet,&#10;Chennai – 600 015, Tamil Nadu." className="bg-muted h-28" />
                            </div>

                             <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject: *</FormLabel>
                                    <FormControl><Input placeholder="Brief subject of your grievance" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />

                             <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Respected Sir/Madam,</FormLabel>
                                     <div className="relative">
                                        <FormControl>
                                            <Textarea placeholder="Please detail your grievance here..." className="min-h-48 pr-10" {...field} />
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground"><Mic className="h-4 w-4"/></Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                             )} />

                            <div className="flex justify-between items-end pt-8">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="date" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date: *</FormLabel>
                                            <FormControl><Input type="date" className="w-fit" {...field} /></FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="place" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Place: *</FormLabel>
                                            <FormControl><Input placeholder="Your Place" className="w-fit" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="text-right">
                                    <p>Sincerely,</p>
                                     <FormField control={form.control} name="sincerelyName" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Your Name (for signature)" className="w-48 mt-1 border-0 border-b rounded-none focus-visible:ring-0 text-center font-semibold" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                           <Card>
                                <CardHeader><CardTitle>Petitioner Contact Details (Mandatory for reply):</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="10-digit mobile" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Aadhaar Number</FormLabel><FormControl><Input placeholder="12-digit Aadhaar" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                     </div>
                                      <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email ID (Optional, for reply)</FormLabel><FormControl><Input type="email" placeholder="youremail@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                      )} />
                                     <p className="text-xs text-muted-foreground">Note: Contact Number and Email are mandatory for your grievance to be processed and to receive a reply. If left blank, it will be treated as anonymous.</p>
                                </CardContent>
                           </Card>
                            <Card>
                                <CardHeader><CardTitle>Attachment (Optional, Max 20MB)</CardTitle></CardHeader>
                                <CardContent>
                                     <FormField control={form.control} name="attachment" render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input 
                                                    type="file" 
                                                    ref={fileInputRef}
                                                    accept={SUPPORTED_FORMATS}
                                                    onChange={handleFileChange}
                                                />
                                            </FormControl>
                                             <p className="text-xs text-muted-foreground pt-1">{SUPPORTED_FORMATS}</p>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                     {file && (
                                        <div className="flex items-center gap-2 p-2 mt-2 bg-muted rounded-md text-sm">
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
                                 <Button type="button" onClick={onFormTrigger}>Submit Grievance</Button>
                              </AlertDialogTrigger>
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
                                <AlertDialogTrigger asChild>
                                  <button id="submit-trigger-button" className="hidden"></button>
                               </AlertDialogTrigger>
                           </AlertDialog>
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
