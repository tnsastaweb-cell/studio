
'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

import { MOCK_SCHEMES } from '@/services/schemes';
import { DISTRICTS, useDistrictOffices } from '@/services/district-offices';
import { useUsers, User } from '@/services/users';
import { useHlc, HlcItem } from '@/services/hlc';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mgnregsSchema = z.object({
  fmParas: z.coerce.number().optional(),
  fmAmount: z.coerce.number().optional(),
  fdParas: z.coerce.number().optional(),
  fdAmount: z.coerce.number().optional(),
  pvParas: z.coerce.number().optional(),
  pvAmount: z.coerce.number().optional(),
  grParas: z.coerce.number().optional(),
  grAmount: z.coerce.number().optional(),
});

const formSchema = z.object({
  scheme: z.string().min(1),
  district: z.string().min(1, "District is required"),
  drpName: z.string().min(1, "DRP Name is required"),
  hlcNo: z.string().min(1, "HLC No. is required"),
  hlcDate: z.date({ required_error: "HLC Date is required" }),
  proceedingNo: z.string().min(1, "Proceeding No. is required"),
  proceedingDate: z.date({ required_error: "Proceeding Date is required" }),
  placedParas: z.coerce.number().min(0, "Cannot be negative"),
  closedParas: z.coerce.number().min(0, "Cannot be negative"),
  recoveredAmount: z.coerce.number().min(0).optional(),
  fir: z.enum(['yes', 'no']),
  firNo: z.string().optional(),
  firDetails: z.string().optional(),
  firCopy: z.any().optional(),
  charges: z.enum(['yes', 'no']),
  chargeDetails: z.string().optional(),
  chargesDescription: z.string().optional(),
  chargesCopy: z.any().optional(),
  actionTaken: z.string().optional(),
  hlcMinutesFile: z.any().optional(),
  mgnregsDetails: mgnregsSchema.optional(),
}).refine(data => data.closedParas <= data.placedParas, {
  message: "Closed paras cannot be more than placed paras",
  path: ["closedParas"],
});

type FormValues = z.infer<typeof formSchema>;

const HlcForm = ({ scheme }: { scheme: string }) => {
  const { users } = useUsers();
  const { addHlc, generateHlcRegNo } = useHlc();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedRegNo, setGeneratedRegNo] = useState<string | null>(null);
  const [hlcFile, setHlcFile] = useState<File | null>(null);
  const [firFile, setFirFile] = useState<File | null>(null);
  const [chargesFile, setChargesFile] = useState<File | null>(null);

  const drps = useMemo(() => {
    return users.filter(u => u.designation === 'DRP' || u.designation === 'DRP I/C');
  }, [users]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scheme,
      fir: 'no',
      charges: 'no',
      mgnregsDetails: { fmParas: 0, fmAmount: 0, fdParas: 0, fdAmount: 0, pvParas: 0, pvAmount: 0, grParas: 0, grAmount: 0 },
    },
  });

  const placedParas = form.watch('placedParas') || 0;
  const closedParas = form.watch('closedParas') || 0;
  const pendingParas = placedParas - closedParas;

  const handleGenerateId = () => {
    const values = form.getValues();
    if (values.district && values.hlcNo && values.hlcDate) {
      const regNo = generateHlcRegNo({
        scheme: values.scheme,
        district: values.district,
        hlcNo: values.hlcNo,
        date: values.hlcDate,
      });
      setGeneratedRegNo(regNo);
      toast({ title: "Registration Number Generated", description: regNo });
    } else {
      form.trigger(['district', 'hlcNo', 'hlcDate']);
      toast({ variant: 'destructive', title: "Missing Details", description: "Please fill District, HLC No, and HLC Date to generate ID." });
    }
  };

  const handleFileUpload = (file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>, fieldName: string) => {
    if (file && file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({ variant: 'destructive', title: "File too large", description: `${fieldName} file must be 50MB or smaller.` });
      return false;
    }
    setter(file);
    return true;
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!generatedRegNo) {
      toast({ variant: 'destructive', title: "Submission Failed", description: "Please generate a registration number first." });
      return;
    }
    setIsSubmitting(true);

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    try {
        const hlcMinutesData = hlcFile ? { name: generatedRegNo + '_minutes', originalName: hlcFile.name, dataUrl: await readFileAsDataURL(hlcFile) } : undefined;
        const firCopyData = firFile ? { name: generatedRegNo + '_fir', originalName: firFile.name, dataUrl: await readFileAsDataURL(firFile) } : undefined;
        const chargesCopyData = chargesFile ? { name: generatedRegNo + '_charges', originalName: chargesFile.name, dataUrl: await readFileAsDataURL(chargesFile) } : undefined;

        const finalData: Omit<HlcItem, 'id'> = {
            ...data,
            regNo: generatedRegNo,
            pendingParas: pendingParas,
            hlcDate: format(data.hlcDate, 'yyyy-MM-dd'),
            proceedingDate: format(data.proceedingDate, 'yyyy-MM-dd'),
            hlcMinutes: hlcMinutesData,
            firCopy: firCopyData,
            chargesCopy: chargesCopyData,
        };
        
        addHlc(finalData);
        toast({ title: "Success!", description: `HLC entry ${generatedRegNo} has been saved.` });
        form.reset({
            scheme,
            fir: 'no',
            charges: 'no',
            mgnregsDetails: { fmParas: 0, fmAmount: 0, fdParas: 0, fdAmount: 0, pvParas: 0, pvAmount: 0, grParas: 0, grAmount: 0 },
        });
        setGeneratedRegNo(null);
        setHlcFile(null);
        setFirFile(null);
        setChargesFile(null);
    } catch (error) {
        toast({ variant: "destructive", title: "File Upload Failed", description: "Could not process one of the files. Please try again." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>HLC Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem><FormLabel>District</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                    <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="drpName" render={({ field }) => (
                <FormItem><FormLabel>DRP/DRP I/C Name</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select DRP" /></SelectTrigger></FormControl>
                    <SelectContent>{drps.map(drp => <SelectItem key={drp.id} value={drp.name}>{drp.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="hlcNo" render={({ field }) => (<FormItem><FormLabel>HLC No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="hlcDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>HLC Date</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                    </Popover><FormMessage /></FormItem>
             )} />
             <FormField control={form.control} name="proceedingNo" render={({ field }) => (<FormItem><FormLabel>Proceeding No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="proceedingDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Proceeding Date</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                    </Popover><FormMessage /></FormItem>
             )} />
             <FormField control={form.control} name="placedParas" render={({ field }) => (<FormItem><FormLabel>No. of Paras Placed</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="closedParas" render={({ field }) => (<FormItem><FormLabel>No. of Paras Closed</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
             <FormItem><FormLabel>Pending</FormLabel><FormControl><Input value={pendingParas < 0 ? 'Invalid' : pendingParas} readOnly className="bg-muted" /></FormControl></FormItem>
          </CardContent>
        </Card>

        {scheme === 'MGNREGS' && (
             <Card>
                <CardHeader><CardTitle>Para Details (MGNREGS)</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField control={form.control} name="mgnregsDetails.fmParas" render={({ field }) => (<FormItem><FormLabel>FM - No. of Paras</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.fmAmount" render={({ field }) => (<FormItem><FormLabel>FM - Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.fdParas" render={({ field }) => (<FormItem><FormLabel>FD - No. of Paras</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.fdAmount" render={({ field }) => (<FormItem><FormLabel>FD - Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.pvParas" render={({ field }) => (<FormItem><FormLabel>PV - No. of Paras</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.pvAmount" render={({ field }) => (<FormItem><FormLabel>PV - Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.grParas" render={({ field }) => (<FormItem><FormLabel>GR - No. of Paras</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="mgnregsDetails.grAmount" render={({ field }) => (<FormItem><FormLabel>GR - Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
             </Card>
        )}

        <Card>
            <CardHeader><CardTitle>Action & Recovery</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="recoveredAmount" render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>Recovered Amount in HLC</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <div className="md:col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="fir" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>FIR</FormLabel><FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                    {form.watch('fir') === 'yes' && (
                        <>
                            <FormField control={form.control} name="firNo" render={({ field }) => (<FormItem><FormLabel>NO OF FIR / FIR No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="firDetails" render={({ field }) => (<FormItem><FormLabel>FIR Details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="firCopy" render={({ field }) => (
                                <FormItem><FormLabel>Upload FIR Copy</FormLabel><FormControl>
                                <Input type="file" onChange={(e) => {
                                    field.onChange(e.target.files);
                                    handleFileUpload(e.target.files?.[0] || null, setFirFile, 'FIR Copy');
                                }} />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                        </>
                    )}
                </div>

                <div className="md:col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="charges" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Charges</FormLabel><FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                     )} />
                     {form.watch('charges') === 'yes' && (
                         <>
                            <FormField control={form.control} name="chargeDetails" render={({ field }) => (<FormItem><FormLabel>NO OF CHARGES / What kind of charges?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="chargesDescription" render={({ field }) => (<FormItem><FormLabel>Charges Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="chargesCopy" render={({ field }) => (
                                <FormItem><FormLabel>Upload Charges Copy</FormLabel><FormControl>
                                <Input type="file" onChange={(e) => {
                                    field.onChange(e.target.files);
                                    handleFileUpload(e.target.files?.[0] || null, setChargesFile, 'Charges Copy');
                                }} />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                         </>
                     )}
                </div>

                <FormField control={form.control} name="actionTaken" render={({ field }) => (
                    <FormItem className="md:col-span-full"><FormLabel>Action Taken Details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="hlcMinutesFile" render={({ field }) => (
                    <FormItem className="md:col-span-full"><FormLabel>HLC Minutes Upload (Max 50MB)</FormLabel><FormControl>
                        <Input type="file" onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileUpload(e.target.files?.[0] || null, setHlcFile, 'HLC Minutes');
                        }} />
                    </FormControl><FormMessage /></FormItem>
                 )} />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4 items-center">
            {generatedRegNo && <p className="text-primary font-bold bg-primary/10 p-2 rounded-md">Reg No: {generatedRegNo}</p>}
            <Button type="button" variant="outline" onClick={handleGenerateId}>Generate Registration No.</Button>
            <Button type="submit" disabled={!generatedRegNo || isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Verify & Submit"}
            </Button>
        </div>
      </form>
    </Form>
  );
};


export default function HlcEntryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>HLC Entry Form</CardTitle>
            <CardDescription>Enter High-Level Committee meeting details for each scheme.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={MOCK_SCHEMES[0].id} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {MOCK_SCHEMES.map(scheme => (
                  <TabsTrigger key={scheme.id} value={scheme.id}>{scheme.name}</TabsTrigger>
                ))}
              </TabsList>
              {MOCK_SCHEMES.map(scheme => (
                <TabsContent key={scheme.id} value={scheme.id} className="pt-6">
                    {scheme.name === 'MGNREGS' ? (
                        <HlcForm scheme={scheme.name} />
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <p>The form for {scheme.name} is currently under construction. Please check back later.</p>
                        </div>
                    )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
