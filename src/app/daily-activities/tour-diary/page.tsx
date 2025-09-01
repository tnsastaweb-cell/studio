
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReactToPrint } from 'react-to-print';

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
import { Calendar as CalendarIcon, Mic, ChevronsUpDown, Check, Printer, Search, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, getDaysInMonth, startOfMonth, getMonth, getYear } from 'date-fns';
import { useUsers, User } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { useTourDiary, TourDiaryRecord } from '@/services/tour-diary';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


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
    const [isEmployeeCodeOpen, setEmployeeCodeOpen] = useState(false);

    const form = useForm<TourDiaryFormValues>({
        resolver: zodResolver(tourDiarySchema),
        defaultValues: {
            date: new Date(),
        }
    });

    const watchedEmployeeCode = form.watch("employeeCode");

    useEffect(() => {
        const user = users.find(u => u.employeeCode === watchedEmployeeCode);
        if (user) {
            form.setValue('name', user.name);
            form.setValue('role', user.designation);
            const presentStation = user.brpWorkHistory?.find(h => h.station === 'present') || user.drpWorkHistory?.find(h => h.station === 'present');
            form.setValue('district', presentStation?.district || user.district || '');
        }
    }, [watchedEmployeeCode, users, form]);

    const onSubmit = (data: TourDiaryFormValues) => {
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
                            <FormField control={form.control} name="employeeCode" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Employee Code</FormLabel>
                                <Popover open={isEmployeeCodeOpen} onOpenChange={setEmployeeCodeOpen}>
                                    <PopoverTrigger asChild><FormControl>
                                        <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                            {field.value ? field.value : "Select Employee"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button></FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search employee code..." />
                                            <CommandEmpty>No employee found.</CommandEmpty>
                                            <CommandList>
                                                {users.map(u => (
                                                    <CommandItem value={u.employeeCode} key={u.id} onSelect={() => { form.setValue("employeeCode", u.employeeCode); setEmployeeCodeOpen(false);}}>
                                                        <Check className={cn("mr-2 h-4 w-4", u.employeeCode === field.value ? "opacity-100" : "opacity-0")} />
                                                        {u.employeeCode}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover><FormMessage /></FormItem>
                             )} />
                             <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                             <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                             <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
    );
};

const PreviewTab = () => {
    const { entries, deleteEntry } = useTourDiary();
     const { toast } = useToast();

    const handleDelete = (id: number) => {
        deleteEntry(id);
        toast({ title: 'Deleted', description: 'Tour diary entry has been deleted.' });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preview Tour Diaries</CardTitle>
                <CardDescription>Search, view, edit, and delete submitted diary entries.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Camp Place</TableHead>
                                <TableHead>Distance (km)</TableHead>
                                <TableHead>Work Summary</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{entry.date}</TableCell>
                                    <TableCell>{entry.employeeCode}</TableCell>
                                    <TableCell>{entry.name}</TableCell>
                                    <TableCell>{entry.campPlace}</TableCell>
                                    <TableCell>{entry.distance}</TableCell>
                                    <TableCell className="max-w-xs truncate">{entry.workSummary}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this tour diary entry.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
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
};

const reportYears = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
const reportMonths = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));

const PrintTab = () => {
    const { users } = useUsers();
    const { entries } = useTourDiary();
    const printRef = useRef(null);
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [reportData, setReportData] = useState<TourDiaryRecord[] | null>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });
    
    const handleGetReport = () => {
        if (!selectedEmployee) return;
        const filtered = entries.filter(e => 
            e.employeeCode === selectedEmployee.employeeCode &&
            e.year === selectedYear &&
            e.month === selectedMonth
        );
        setReportData(filtered);
    }
    
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    const datesOfMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthlySummary = useMemo(() => {
        if (!reportData || reportData.length === 0) return null;
        // Find the record with the most recent date to get the summary fields
        const latestRecord = reportData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        return {
            hqWorkDays: latestRecord.hqWorkDays,
            fieldVisitDays: latestRecord.fieldVisitDays,
            hlcMeetingHeld: latestRecord.hlcMeetingHeld,
            hlcMeetingAttended: latestRecord.hlcMeetingAttended,
            totalCampDays: latestRecord.totalCampDays,
            leaveDays: latestRecord.leaveDays,
            holidays: latestRecord.holidays,
            totalDays: latestRecord.totalDays,
        };
    }, [reportData]);

    return (
        <Card>
            <CardHeader><CardTitle>Print Tour Diary</CardTitle></CardHeader>
            <CardContent>
                 <div className="flex gap-4 mb-6 p-4 border rounded-lg bg-card shadow-sm items-end">
                    <Select onValueChange={(val) => setSelectedEmployee(users.find(u=>u.employeeCode === val) || null)}>
                        <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                        <SelectContent>
                            {users.map(u => <SelectItem key={u.id} value={u.employeeCode}>{u.name} ({u.employeeCode})</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedMonth.toString()} onValueChange={val => setSelectedMonth(parseInt(val))}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Month" /></SelectTrigger>
                        <SelectContent>
                            {reportMonths.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedYear.toString()} onValueChange={val => setSelectedYear(parseInt(val))}>
                        <SelectTrigger className="w-[120px]"><SelectValue placeholder="Select Year" /></SelectTrigger>
                        <SelectContent>
                            {reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGetReport}><Search className="mr-2"/> Get Reports</Button>
                    <Button onClick={handlePrint} variant="outline" disabled={!reportData}><Printer className="mr-2"/> Print</Button>
                 </div>
                 
                 {reportData && (
                 <div ref={printRef} className="print-container bg-white text-black p-8 border rounded-md font-sans">
                      <style>{`
                        @media print {
                          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                          .print-container {
                            width: 297mm;
                            height: 210mm;
                            margin: auto;
                            padding: 1cm;
                            box-shadow: none;
                            border: 1px solid black !important;
                           }
                           @page {
                            size: A4 landscape;
                            margin: 1cm;
                          }
                        }
                      `}</style>
                      <div className="header-section text-center space-y-1 mb-4">
                        <h1 className="text-xl font-bold">தமிழ்நாடு சமூக தணிக்கை சங்கம்</h1>
                        <h2 className="font-semibold">{selectedEmployee?.district} மாவட்டம்</h2>
                        <h3 className="font-semibold">நாட்குறிப்பு விவரம் - {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')} மாதத்திற்கான பணி விவர அறிக்கை</h3>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <div>
                            <p><strong>பெயர்:</strong> {selectedEmployee?.name}</p>
                            <p><strong>பதவி:</strong> {selectedEmployee?.designation}</p>
                        </div>
                         <div>
                            <p><strong>மாவட்டம்:</strong> {selectedEmployee?.district}</p>
                        </div>
                      </div>
                      <table className="w-full border-collapse border border-black text-sm">
                        <thead>
                            <tr className="border border-black bg-gray-200">
                                <th className="border border-black p-1 w-10">வ.எண்</th>
                                <th className="border border-black p-1 w-24">தேதி</th>
                                <th className="border border-black p-1">புறப்பட்ட இடம்</th>
                                <th className="border border-black p-1">முகாம் சென்ற இடம்</th>
                                <th className="border border-black p-1 w-24">வாகன விவரம்</th>
                                <th className="border border-black p-1 w-20">தூரம் (கி.மீ)</th>
                                <th className="border border-black p-1">பணிவிபரச் சுருக்கம்</th>
                            </tr>
                        </thead>
                        <tbody>
                             {datesOfMonth.map((day, index) => {
                                const dateStr = format(new Date(selectedYear, selectedMonth, day), 'yyyy-MM-dd');
                                const entry = reportData.find(e => e.date === dateStr);
                                return (
                                <tr key={day} className="border border-black h-10">
                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                    <td className="border border-black p-1 text-center">{format(new Date(selectedYear, selectedMonth, day), 'dd.MM.yyyy')}</td>
                                    <td className="border border-black p-1">{entry?.departurePlace || ''}</td>
                                    <td className="border border-black p-1">{entry?.campPlace || ''}</td>
                                    <td className="border border-black p-1">{entry?.vehicleDetails || ''}</td>
                                    <td className="border border-black p-1 text-center">{entry?.distance || ''}</td>
                                    <td className="border border-black p-1">{entry?.workSummary || ''}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                      </table>
                      
                       {monthlySummary && (
                            <div className="summary-section mt-4 text-sm">
                                <h4 className="font-bold mb-2">பணி விவரங்கள் சுருக்கம்</h4>
                                <table className="w-1/2">
                                    <tbody>
                                        <tr><td className="pr-4 py-1">தலைமை இடத்தில் இருந்து பணி செய்த நாட்கள்</td><td className="text-right pr-12">{monthlySummary.hqWorkDays}</td></tr>
                                        <tr><td className="pr-4 py-1">சமூக தணிக்கை கள ஆய்வு செய்த நாட்கள்</td><td className="text-right pr-12">{monthlySummary.fieldVisitDays}</td></tr>
                                        <tr><td className="pr-4 py-1">அ. உயர்மட்டக்குழு கூட்டம் நடைபெற்ற நாட்கள்</td><td className="text-right pr-12">{monthlySummary.hlcMeetingHeld}</td></tr>
                                        <tr><td className="pr-4 py-1">ஆ. கலந்து கொண்ட நாட்கள்</td><td className="text-right pr-12">{monthlySummary.hlcMeetingAttended}</td></tr>
                                        <tr><td className="pr-4 py-1">முகாம் சென்ற மொத்த நாட்கள்</td><td className="text-right pr-12">{monthlySummary.totalCampDays}</td></tr>
                                        <tr><td className="pr-4 py-1">விடுப்பு எடுத்த நாட்கள்</td><td className="text-right pr-12">{monthlySummary.leaveDays}</td></tr>
                                        <tr><td className="pr-4 py-1">அரசு விடுமுறை நாட்கள்</td><td className="text-right pr-12">{monthlySummary.holidays}</td></tr>
                                        <tr className="font-bold border-t border-black"><td className="pr-4 py-1">மொத்த நாட்கள்</td><td className="text-right pr-12">{monthlySummary.totalDays}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="footer-section flex justify-between mt-12 text-sm">
                            <div>
                                <p>பெறுநர்</p>
                                <p className="font-semibold">இயக்குநர்,</p>
                                <p>தமிழ்நாடு சமூக தணிக்கை சங்கம், சென்னை-15</p>
                                <p>அவர்களுக்கு பணிந்து சமர்ப்பிக்கப்படுகிறது.</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold pt-8">{selectedEmployee?.designation}</p>
                                <p>{selectedEmployee?.district} மாவட்டம்</p>
                            </div>
                        </div>
                 </div>
                 )}
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
