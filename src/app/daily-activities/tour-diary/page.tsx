
'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useUsers } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { useTourDiary } from '@/services/tour-diary';


const tourDiarySchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required."),
  name: z.string(),
  role: z.string(),
  district: z.string(),
  date: z.date({ required_error: "Date is required." }),
  departurePlace: z.string().min(1, "Departure place is required."),
  campPlace: z.string().min(1, "Camp place is required."),
  vehicleDetails: z.string().min(1, "Vehicle details are required."),
  distance: z.coerce.number().min(0, "Distance cannot be negative."),
  workSummary: z.string().min(10, "Work summary must be at least 10 characters."),
  
  // Monthly Summary Fields
  hqWorkDays: z.coerce.number().default(0),
  fieldVisitDays: z.coerce.number().default(0),
  hlcMeetingHeld: z.coerce.number().default(0),
  hlcMeetingAttended: z.coerce.number().default(0),
  totalCampDays: z.coerce.number().default(0),
  leaveDays: z.coerce.number().default(0),
  holidays: z.coerce.number().default(0),
  totalDays: z.coerce.number().default(0),
});

type TourDiaryFormValues = z.infer<typeof tourDiarySchema>;


const EnterTab = () => {
    const { users } = useUsers();
    const { toast } = useToast();
    const { addEntry } = useTourDiary();

    const form = useForm<TourDiaryFormValues>({
        resolver: zodResolver(tourDiarySchema),
        defaultValues: {
            date: new Date(),
        }
    });

    const onSubmit = (data: TourDiaryFormValues) => {
        console.log(data);
        const date = new Date(data.date);
        addEntry({
            ...data,
            date: format(data.date, 'yyyy-MM-dd'),
            month: date.getMonth(),
            year: date.getFullYear(),
        });
        toast({ title: "Success!", description: "Tour diary entry saved." });
        form.reset();
    };
    
    return (
        <Card>
            <CardHeader><CardTitle>Enter Tour Diary Details</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                             {/* Auto-filled fields */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>தேதி</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                </Popover><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="departurePlace" render={({ field }) => (<FormItem><FormLabel>புறப்பட்ட இடம்</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="campPlace" render={({ field }) => (<FormItem><FormLabel>முகாம் சென்ற இடம்</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="vehicleDetails" render={({ field }) => (<FormItem><FormLabel>வாகன விவரம்</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>தூரம் (கி.மீ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <FormField control={form.control} name="workSummary" render={({ field }) => (
                            <FormItem>
                                <FormLabel>பணிவிபரச் சுருக்கம்</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                         <Textarea className="min-h-32 pr-10" {...field} />
                                         <Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground"><Mic className="h-4 w-4"/></Button>
                                    </div>
                                </FormControl><FormMessage />
                            </FormItem>
                         )} />
                         <div className="pt-6 mt-6 border-t">
                            <h3 className="text-lg font-semibold mb-4">பணி விவரங்கள் சுருக்கம் (மாத இறுதியில் நிரப்பவும்)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                <FormField control={form.control} name="hqWorkDays" render={({ field }) => (<FormItem><FormLabel>தலைமை இடத்தில் இருந்து பணி செய்த நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="fieldVisitDays" render={({ field }) => (<FormItem><FormLabel>சமூக தணிக்கை கள ஆய்வு செய்த நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="hlcMeetingHeld" render={({ field }) => (<FormItem><FormLabel>அ. உயர்மட்டக்குழு கூட்டம் நடைபெற்ற நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="hlcMeetingAttended" render={({ field }) => (<FormItem><FormLabel>ஆ. கலந்து கொண்ட நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="totalCampDays" render={({ field }) => (<FormItem><FormLabel>முகாம் சென்ற மொத்த நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="leaveDays" render={({ field }) => (<FormItem><FormLabel>விடுப்பு எடுத்த நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="holidays" render={({ field }) => (<FormItem><FormLabel>அரசு விடுமுறை நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="totalDays" render={({ field }) => (<FormItem><FormLabel>மொத்த நாட்கள்</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                         </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
                            <Button type="submit">Submit</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

const PreviewTab = () => {
    return (
        <Card>
            <CardHeader><CardTitle>Preview Tour Diaries</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is under construction. You will be able to search, view, edit, and delete submitted diary entries here.</p>
            </CardContent>
        </Card>
    );
};

const PrintTab = () => {
    return (
        <Card>
            <CardHeader><CardTitle>Print Tour Diary</CardTitle></CardHeader>
            <CardContent>
                 <p className="text-muted-foreground">This section is under construction. You will be able to generate a print-friendly A4 report here.</p>
            </CardContent>
        </Card>
    );
};

export default function TourDiaryPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Tour Diary</CardTitle>
                        <CardDescription>Manage your daily tour and work activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="enter" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="enter">Enter</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="print">Print</TabsTrigger>
                            </TabsList>
                            <TabsContent value="enter" className="pt-6">
                               <EnterTab />
                            </TabsContent>
                            <TabsContent value="preview" className="pt-6">
                                <PreviewTab />
                            </TabsContent>
                            <TabsContent value="print" className="pt-6">
                                <PrintTab />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

