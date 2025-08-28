
'use client';

import React, { useState, useMemo, useEffect, forwardRef, FC } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, getYear, isWithinInterval, parseISO } from 'date-fns';

import { useAuth } from '@/hooks/use-auth';
import { useUsers, User } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';
import { useHlc } from '@/services/hlc';
import { usePmaygIssues, PmaygIssue } from '@/services/pmayg-issues';
import { uniqueDistricts } from '@/lib/utils';
import { cn } from '@/lib/utils';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';

// Schemas
const paraParticularsSchema = z.object({
  issueNumber: z.string(),
  type: z.string().min(1, "Type is required."),
  category: z.string().min(1, "Category is required."),
  subCategory: z.string(),
  codeNumber: z.string(),
  beneficiaries: z.coerce.number().default(0),
  centralAmount: z.coerce.number().default(0),
  stateAmount: z.coerce.number().default(0),
  otherAmount: z.coerce.number().default(0),
  grievances: z.coerce.number().default(0),
  hlcRegNo: z.string().optional(),
  paraStatus: z.enum(['PENDING', 'CLOSED']).default('PENDING'),
  recoveryAmount: z.coerce.number().default(0),
});

const pmaygFormSchema = z.object({
  // Section A - BRP Details
  brpEmployeeCode: z.string(),
  brpName: z.string(),
  brpContact: z.string(),
  brpDistrict: z.string(),
  brpBlock: z.string(),

  // Section B - Basic Details
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  lgdCode: z.string(),
  roundNo: z.string().min(1, "Round No. is required"),
  auditStartDate: z.date({ required_error: "Start Date is required" }),
  auditEndDate: z.date({ required_error: "End Date is required" }),
  sgsDate: z.date({ required_error: "SGS Date is required" }),
  expenditureYear: z.string().default('2016-2022'),
  auditYear: z.string(),
  observer: z.enum(['yes', 'no']),
  observerName: z.string().optional(),
  coram: z.coerce.number().max(999, "Must be max 3 digits"),

  // Section C - Verification Details
  totalHouses: z.coerce.number().default(0),
  housesVisited: z.coerce.number().default(0),
  housesNotVisited: z.coerce.number().default(0),
  firstInstallment: z.coerce.number().default(0),
  secondInstallment: z.coerce.number().default(0),
  thirdInstallment: z.coerce.number().default(0),
  fourthInstallment: z.coerce.number().default(0),
  notCompletedAfterFourth: z.coerce.number().default(0),
  
  // Section D - Panchayat Summary
  gsDecision: z.enum(['yes', 'no']),
  projectDeficiencies: z.string().optional(),
  specialRemarks: z.string().optional(),
  auditOutcome: z.string().optional(),

  // Section E - Panchayat Verification Analysis
  misSeccCount: z.coerce.number().default(0),
  misSeccNonRejected: z.coerce.number().default(0),
  misSeccSelected: z.coerce.number().default(0),
  misAwaasPlusCount: z.coerce.number().default(0),
  misAwaasPlusSelected: z.coerce.number().default(0),
  misTotalSelected: z.coerce.number().default(0),
  fieldInterviewed: z.coerce.number().default(0),
  fieldVisited: z.coerce.number().default(0),
  fieldCouldNotIdentify: z.coerce.number().default(0),
  fieldTotalVerified: z.coerce.number().default(0),
  format3KutchaCount: z.coerce.number().default(0),

  // Section F - Report
  reportFile: z.any().optional(),

  // Section G - Para Particulars
  paraParticulars: z.array(paraParticularsSchema).optional(),
});

type PmaygFormValues = z.infer<typeof pmaygFormSchema>;
type ParaParticularsValues = z.infer<typeof paraParticularsSchema>;

const uniquePmaygTypes = Array.from(new Set(MOCK_PMAYG_DATA.map(d => d.type)));

const ParaParticularsItem: FC<{ index: number; control: any; form: any; remove: (index: number) => void; hlcItems: any[] }> = ({ index, control, form, remove, hlcItems }) => {
    const selectedType = useWatch({ control, name: `paraParticulars.${index}.type` });
    const selectedCategoryValue = useWatch({ control, name: `paraParticulars.${index}.category` });

    const categories = useMemo(() => {
        if (!selectedType) return [];
        return Array.from(new Set(MOCK_PMAYG_DATA.filter(d => d.type === selectedType).map(d => d.category)));
    }, [selectedType]);
    
    useEffect(() => {
        const categoryData = MOCK_PMAYG_DATA.find(d => d.type === selectedType && d.category === selectedCategoryValue);
        if (categoryData) {
            form.setValue(`paraParticulars.${index}.subCategory`, categoryData.subCategory);
            form.setValue(`paraParticulars.${index}.codeNumber`, categoryData.codeNumber);
        } else {
             form.setValue(`paraParticulars.${index}.subCategory`, '');
             form.setValue(`paraParticulars.${index}.codeNumber`, '');
        }
    }, [selectedCategoryValue, selectedType, index, form]);

    return (
        <div className="p-4 border rounded-lg space-y-4 relative bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField control={form.control} name={`paraParticulars.${index}.issueNumber`} render={({ field }) => (<FormItem><FormLabel>Issue No.</FormLabel><FormControl><Input {...field} readOnly className="bg-muted font-bold" /></FormControl></FormItem>)} />
                <Controller control={form.control} name={`paraParticulars.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`paraParticulars.${index}.category`, ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent>{uniquePmaygTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                <Controller control={form.control} name={`paraParticulars.${index}.category`} render={({ field }) => (
                     <FormItem className="lg:col-span-2">
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedType}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Category"/></SelectTrigger></FormControl>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                     </FormItem>
                )} />
            </div>
             <div className="grid grid-cols-1 gap-4">
                 <FormField control={form.control} name={`paraParticulars.${index}.subCategory`} render={({ field }) => (
                    <FormItem><FormLabel>Sub Category</FormLabel><FormControl><Textarea readOnly {...field} className="bg-muted h-28" /></FormControl></FormItem>
                 )} />
                 <FormField control={form.control} name={`paraParticulars.${index}.codeNumber`} render={({ field }) => (
                    <FormItem><FormLabel>Code No.</FormLabel><FormControl><Input readOnly {...field} className="bg-muted w-32" /></FormControl></FormItem>
                 )} />
             </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 <FormField control={form.control} name={`paraParticulars.${index}.beneficiaries`} render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                 <FormField control={form.control} name={`paraParticulars.${index}.centralAmount`} render={({ field }) => (<FormItem><FormLabel>Central Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                 <FormField control={form.control} name={`paraParticulars.${index}.stateAmount`} render={({ field }) => (<FormItem><FormLabel>State Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                 <FormField control={form.control} name={`paraParticulars.${index}.otherAmount`} render={({ field }) => (<FormItem><FormLabel>Others Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                 <FormField control={form.control} name={`paraParticulars.${index}.grievances`} render={({ field }) => (<FormItem><FormLabel>No. of Grievances</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                 <Controller control={form.control} name={`paraParticulars.${index}.hlcRegNo`} render={({ field }) => (<FormItem><FormLabel>HLC Reg No.</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select HLC No."/></SelectTrigger></FormControl><SelectContent>{hlcItems.map(item => <SelectItem key={item.id} value={item.regNo}>{item.regNo}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                 <Controller control={form.control} name={`paraParticulars.${index}.paraStatus`} render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent></Select></FormItem>)} />
                 <FormField control={form.control} name={`paraParticulars.${index}.recoveryAmount`} render={({ field }) => (<FormItem><FormLabel>Recovery Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};


export default function PmaygDataEntryPage() {
    const { user, loading } = useAuth();
    const { users } = useUsers();
    const { toast } = useToast();
    const { hlcItems } = useHlc();
    const { getNextIssueSerialNumber, addIssue: saveIssue } = usePmaygIssues();
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<PmaygFormValues>({
        resolver: zodResolver(pmaygFormSchema),
        defaultValues: {
            expenditureYear: '2016-2022',
            observer: 'no',
            gsDecision: 'yes',
            paraParticulars: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "paraParticulars",
    });

    // Populate BRP details on mount
    useEffect(() => {
        if (user) {
            const brpDetails = users.find(u => u.id === user.id);
            if (brpDetails) {
                const presentStation = brpDetails.brpWorkHistory?.find(h => h.station === 'present') || brpDetails.drpWorkHistory?.find(h => h.station === 'present');
                form.setValue('brpEmployeeCode', brpDetails.employeeCode);
                form.setValue('brpName', brpDetails.name);
                form.setValue('brpContact', brpDetails.mobileNumber);
                form.setValue('brpDistrict', presentStation?.district || brpDetails.district || '');
                form.setValue('brpBlock', (presentStation as any)?.block || brpDetails.block || '');
            }
        }
    }, [user, users, form]);
    
    // Dependent dropdowns for location
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    // Auto-fill LGD Code
    useEffect(() => {
        if (watchedPanchayat) {
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        } else {
            form.setValue('lgdCode', '');
        }
    }, [watchedPanchayat, form]);

    // Auto-fill Audit Year
    const watchedSgsDate = form.watch("sgsDate");
    useEffect(() => {
        if (watchedSgsDate) {
            const year = getYear(watchedSgsDate);
            const fiscalYearStart = new Date(year, 3, 1); // April 1st
            const auditYear = isWithinInterval(watchedSgsDate, { start: fiscalYearStart, end: new Date(year + 1, 2, 31) })
                ? `${'${year}'}-${'${year + 1}'}`
                : `${'${year - 1}'}-${'${year}'}`;
            form.setValue('auditYear', auditYear);
        }
    }, [watchedSgsDate, form]);
    
     // Auto-calculate totals
    const visited = form.watch("housesVisited");
    const total = form.watch("totalHouses");
    useEffect(() => {
        form.setValue('housesNotVisited', Math.max(0, Number(total) - Number(visited)));
    }, [visited, total, form]);

    const misSeccSelected = form.watch("misSeccSelected");
    const misAwaasPlusSelected = form.watch("misAwaasPlusSelected");
    useEffect(() => {
        form.setValue('misTotalSelected', Number(misSeccSelected) + Number(misAwaasPlusSelected));
    }, [misSeccSelected, misAwaasPlusSelected, form]);
    
    const fieldInterviewed = form.watch("fieldInterviewed");
    const fieldVisited = form.watch("fieldVisited");
    useEffect(() => {
        form.setValue('fieldTotalVerified', Number(fieldInterviewed) + Number(fieldVisited));
    }, [fieldInterviewed, fieldVisited, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
            toast({ variant: 'destructive', title: "File too large", description: "PDF file must not exceed 50MB." });
            setFile(null);
            form.setValue('reportFile', null);
            e.target.value = '';
        } else {
            setFile(selectedFile);
            form.setValue('reportFile', selectedFile);
        }
    };
    
    const handleAddIssue = () => {
        const district = form.getValues('district');
        if (!district) {
            toast({ variant: 'destructive', title: "District Not Selected", description: "Please select a district before adding an issue." });
            return;
        }
        const issueNumber = getNextIssueSerialNumber(district);
        append({
            issueNumber, type: '', category: '', subCategory: '', codeNumber: '', paraStatus: 'PENDING',
            beneficiaries: 0, centralAmount: 0, stateAmount: 0, otherAmount: 0, grievances: 0,
            hlcRegNo: '', recoveryAmount: 0
        });
    };

    const pmaygHlcItems = useMemo(() => hlcItems.filter(item => item.scheme === 'PMAY-G'), [hlcItems]);

    const onSubmit = (data: PmaygFormValues) => {
        // Save para particulars issues to their own storage
        if (data.paraParticulars) {
            data.paraParticulars.forEach(issue => {
                saveIssue(issue as Omit<PmaygIssue, 'id'>);
            });
        }
        console.log("Form Data:", data);
        toast({
            title: "Form Submitted!",
            description: "PMAY-G data has been successfully recorded.",
        });
        // Optionally reset the form
        // form.reset(); 
    };
    
    if (loading) {
       return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>PMAY-G Data Entry</CardTitle>
                                <CardDescription>Enter the details for the PMAY-G scheme audit.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-6">
                                {/* Section A */}
                                <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section A: BRP Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        <FormField control={form.control} name="brpEmployeeCode" render={({ field }) => (<FormItem><FormLabel>Employee Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="brpName" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="brpContact" render={({ field }) => (<FormItem><FormLabel>Contact</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="brpDistrict" render={({ field }) => (<FormItem><FormLabel>Present District</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="brpBlock" render={({ field }) => (<FormItem><FormLabel>Present Block</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                    </div>
                                </section>
                                 {/* Section B */}
                                <section>
                                     <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section B: Basic Details</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                         <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block*</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat*</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="lgdCode" render={({ field }) => (<FormItem><FormLabel>LGD Code*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="roundNo" render={({ field }) => (<FormItem><FormLabel>Round No.*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Round" /></SelectTrigger></FormControl><SelectContent>{['Pilot - 1', ...Array.from({length: 31}, (_, i) => i.toString())].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="auditStartDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Audit Start Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="auditEndDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Audit End Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="sgsDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>SGS Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="expenditureYear" render={({ field }) => (<FormItem><FormLabel>Expenditure Year*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="auditYear" render={({ field }) => (<FormItem><FormLabel>Audit Year*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="observer" render={({ field }) => (<FormItem><FormLabel>Observer*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                         {form.watch('observer') === 'yes' && <FormField control={form.control} name="observerName" render={({ field }) => (<FormItem><FormLabel>Observer Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />}
                                         <FormField control={form.control} name="coram" render={({ field }) => (<FormItem><FormLabel>CORAM (Max 3 digits)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     </div>
                                </section>
                                {/* Section C */}
                                <section>
                                     <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section C: Verification Details</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                         <FormField control={form.control} name="totalHouses" render={({ field }) => (<FormItem><FormLabel>Total Houses*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="housesVisited" render={({ field }) => (<FormItem><FormLabel>No. of Houses Visited*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="housesNotVisited" render={({ field }) => (<FormItem><FormLabel>No. of Houses Not Visited*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="firstInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 1st Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="secondInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 2nd Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="thirdInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 3rd Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="fourthInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 4th Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="notCompletedAfterFourth" render={({ field }) => (<FormItem><FormLabel>Houses Not Completed After 4th Installment*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     </div>
                                </section>
                                 {/* Section D */}
                                <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section D: Panchayat Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="gsDecision" render={({ field }) => (<FormItem><FormLabel>NEW Beneficiary GS Decision*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 mt-4">
                                        <FormField control={form.control} name="projectDeficiencies" render={({ field }) => (<FormItem><FormLabel>Project Deficiencies*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="specialRemarks" render={({ field }) => (<FormItem><FormLabel>Special Remarks*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="auditOutcome" render={({ field }) => (<FormItem><FormLabel>Outcome of Audit*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                    </div>
                                </section>
                                 {/* Section E */}
                                <section>
                                     <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section E: Panchayat Verification Analysis</h3>
                                     <div className="space-y-4">
                                         <p className="font-medium">A. As per MIS Report:</p>
                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
                                             <FormField control={form.control} name="misSeccCount" render={({ field }) => (<FormItem><FormLabel>SECC List Count*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="misSeccNonRejected" render={({ field }) => (<FormItem><FormLabel>SECC Non-Rejected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="misSeccSelected" render={({ field }) => (<FormItem><FormLabel>SECC Selected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="misAwaasPlusCount" render={({ field }) => (<FormItem><FormLabel>Awaas+ List Count*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="misAwaasPlusSelected" render={({ field }) => (<FormItem><FormLabel>Awaas+ Selected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="misTotalSelected" render={({ field }) => (<FormItem><FormLabel>Total Selected (MIS)</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                         </div>
                                         <p className="font-medium">B. Field Verification Data:</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pl-4">
                                             <FormField control={form.control} name="fieldInterviewed" render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries Interviewed*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="fieldVisited" render={({ field }) => (<FormItem><FormLabel>Not Interviewed but House Visited*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="fieldCouldNotIdentify" render={({ field }) => (<FormItem><FormLabel>Could Not Identify*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="fieldTotalVerified" render={({ field }) => (<FormItem><FormLabel>Total Verified (Field)</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                         </div>
                                          <p className="font-medium">C. Format 3 – SECC Beneficiaries in Kutcha Houses:</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                                            <FormField control={form.control} name="format3KutchaCount" render={({ field }) => (<FormItem><FormLabel>Count of SECC-selected beneficiaries still in Kutcha Houses*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                          </div>
                                     </div>
                                </section>
                                 {/* Section F */}
                                 <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section F: Report Upload</h3>
                                     <FormField control={form.control} name="reportFile" render={({ field }) => (
                                        <FormItem><FormLabel>Upload Report (PDF format, max 50MB)</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={handleFileChange} /></FormControl><FormMessage /></FormItem>
                                     )} />
                                     {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
                                </section>
                                
                                {/* Section G */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div><CardTitle>Section G: Para Particulars</CardTitle><CardDescription>Add and manage individual issues found during the audit.</CardDescription></div>
                                        <Button type="button" onClick={handleAddIssue}><PlusCircle className="mr-2"/>Add Issue</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {fields.length === 0 && (<div className="text-center text-muted-foreground py-8">No issues added yet.</div>)}
                                        {fields.map((field, index) => (
                                           <ParaParticularsItem key={field.id} index={index} control={form.control} form={form} remove={remove} hlcItems={pmaygHlcItems} />
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end">
                                    <Button type="submit" size="lg">Submit PMAY-G Report</Button>
                                </div>
                             </CardContent>
                         </Card>
                    </form>
                </Form>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
