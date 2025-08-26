
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, getYear, isWithinInterval, startOfYear, endOfYear } from 'date-fns';

import { MOCK_PMAYG_DATA } from '@/services/pmayg';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';
import { useHlc } from '@/services/hlc';
import { useUsers, User } from '@/services/users';
import { DISTRICTS } from '@/services/district-offices';


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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Upload, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const paraParticularsSchema = z.object({
  issueNumber: z.string(),
  type: z.string().min(1, "Type is required."),
  category: z.string().min(1, "Category is required."),
  subCategory: z.string().min(1, "Sub-category is required."),
  codeNumber: z.string(),
  description: z.string().max(1000, "Description must be 1000 characters or less.").optional(),
  centralAmount: z.coerce.number().optional(),
  stateAmount: z.coerce.number().optional(),
  othersAmount: z.coerce.number().optional(),
  grievances: z.coerce.number().optional(),
  hlcRegNo: z.string().optional(),
  paraStatus: z.enum(['PENDING', 'CLOSED']),
  recoveryAmount: z.coerce.number().optional(),
});

const pmaygFormSchema = z.object({
  // Section A - BRP Details
  employeeCode: z.string().min(1, "Employee Code is required."),
  name: z.string(),
  contact: z.string(),
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
  expenditureYear: z.string(),
  auditYear: z.string(),
  observer: z.enum(['yes', 'no']),
  observerName: z.string().optional(),
  coram: z.coerce.number().max(999, "Must be max 3 digits"),

  // Section C - Verification
  totalHouses: z.coerce.number(),
  housesVisited: z.coerce.number(),
  housesNotVisited: z.coerce.number(),
  firstInstallment: z.coerce.number(),
  secondInstallment: z.coerce.number(),
  thirdInstallment: z.coerce.number(),
  fourthInstallment: z.coerce.number(),
  notCompletedAfterFourth: z.coerce.number(),

  // Section D - Panchayat Summary
  newBeneficiaryDecision: z.enum(['yes', 'no']),
  projectDeficiencies: z.string().optional(),
  specialRemarks: z.string().optional(),
  auditOutcome: z.string().optional(),

  // Section E - Verification Analysis
  seccCount: z.coerce.number(),
  seccNonRejected: z.coerce.number(),
  seccSelected: z.coerce.number(),
  awaasPlusCount: z.coerce.number(),
  awaasPlusSelected: z.coerce.number(),
  totalSelectedMIS: z.coerce.number(),
  beneficiariesInterviewed: z.coerce.number(),
  notInterviewedButVisited: z.coerce.number(),
  couldNotIdentify: z.coerce.number(),
  totalVerifiedField: z.coerce.number(),
  seccInKutcha: z.coerce.number(),

  // Section F - Report
  reportFile: z.any().optional(),

  // Section G - Para Particulars
  paraParticulars: z.array(paraParticularsSchema).optional(),
});

type PmaygFormValues = z.infer<typeof pmaygFormSchema>;

const uniqueTypes = Array.from(new Set(MOCK_PMAYG_DATA.map(d => d.type)));

export default function PmaygDataEntryPage() {
    const { user, loading } = useAuth();
    const { users } = useUsers();
    const { hlcItems } = useHlc();
    const { toast } = useToast();
    
    const [file, setFile] = useState<File | null>(null);
    const [isEmployeeCodeOpen, setEmployeeCodeOpen] = useState(false);

    const pmayHlcItems = useMemo(() => hlcItems.filter(item => item.scheme === 'PMAY-G'), [hlcItems]);

    const sortedDistrictsForCode = useMemo(() => {
        return DISTRICTS.filter(d => d !== "Chennai").sort((a, b) => a.localeCompare(b));
    }, []);

    const getDistrictCode = (district: string) => {
        if (district === "Chennai") return "00";
        const index = sortedDistrictsForCode.indexOf(district);
        return index !== -1 ? String(index + 1).padStart(2, '0') : 'XX';
    };

    const form = useForm<PmaygFormValues>({
        resolver: zodResolver(pmaygFormSchema),
        defaultValues: {
            employeeCode: '',
            name: '',
            contact: '',
            brpDistrict: '',
            brpBlock: '',
            expenditureYear: '2016-2022',
            auditYear: '',
            observer: 'no',
            newBeneficiaryDecision: 'no',
            paraParticulars: [],
            totalHouses: 0, housesVisited: 0, housesNotVisited: 0, firstInstallment: 0,
            secondInstallment: 0, thirdInstallment: 0, fourthInstallment: 0, notCompletedAfterFourth: 0,
            seccCount: 0, seccNonRejected: 0, seccSelected: 0, awaasPlusCount: 0,
            awaasPlusSelected: 0, totalSelectedMIS: 0, beneficiariesInterviewed: 0,
            notInterviewedButVisited: 0, couldNotIdentify: 0, totalVerifiedField: 0,
            seccInKutcha: 0
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "paraParticulars",
    });
    
    const watchedEmployeeCode = form.watch("employeeCode");

    useEffect(() => {
        if (watchedEmployeeCode) {
            const selectedUser = users.find(u => u.employeeCode === watchedEmployeeCode);
            if (selectedUser) {
                const presentStation = selectedUser.designation === 'BRP' 
                    ? selectedUser.brpWorkHistory?.find(h => h.station === 'present')
                    : selectedUser.designation === 'DRP' || selectedUser.designation === 'DRP I/C'
                    ? selectedUser.drpWorkHistory?.find(h => h.station === 'present')
                    : null;
                
                form.setValue('name', selectedUser.name);
                form.setValue('contact', selectedUser.mobileNumber);
                form.setValue('brpDistrict', presentStation?.district || '');
                form.setValue('brpBlock', (presentStation as any)?.block || '');
            }
        }
    }, [watchedEmployeeCode, users, form]);

    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedSgsDate = form.watch("sgsDate");
    const watchedSeccSelected = form.watch("seccSelected");
    const watchedAwaasPlusSelected = form.watch("awaasPlusSelected");
    const watchedInterviewed = form.watch("beneficiariesInterviewed");
    const watchedVisited = form.watch("notInterviewedButVisited");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    useEffect(() => {
        const panchayatLgd = form.watch("panchayat");
        if(panchayatLgd){
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === panchayatLgd)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        } else {
            form.setValue('lgdCode', '');
        }
    }, [form, watchedPanchayat]);
    
    useEffect(() => {
        if (watchedSgsDate) {
            const year = getYear(watchedSgsDate);
            const fiscalYearStart = new Date(year, 3, 1); // April 1st
            const auditYear = isWithinInterval(watchedSgsDate, { start: fiscalYearStart, end: new Date(year + 1, 2, 31) }) 
                ? `${year}-${year + 1}`
                : `${year - 1}-${year}`;
            form.setValue('auditYear', auditYear);
        }
    }, [watchedSgsDate, form]);

    useEffect(() => {
        const total = (Number(watchedSeccSelected) || 0) + (Number(watchedAwaasPlusSelected) || 0);
        form.setValue('totalSelectedMIS', total);
    }, [watchedSeccSelected, watchedAwaasPlusSelected, form]);
    
    useEffect(() => {
        const total = (Number(watchedInterviewed) || 0) + (Number(watchedVisited) || 0);
        form.setValue('totalVerifiedField', total);
    }, [watchedInterviewed, watchedVisited, form]);

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
    
    const addIssue = () => {
        const district = form.getValues('district');
        if (!district) {
            toast({ variant: 'destructive', title: "District Required", description: "Please select a district before adding an issue." });
            return;
        }

        const districtCode = getDistrictCode(district);

        const serialNumber = (form.getValues('paraParticulars')?.length || 0) + 1;
        const issueNumber = `PMAY-${districtCode}-ISSUE-${serialNumber}`;
        
        append({
            issueNumber,
            type: '',
            category: '',
            subCategory: '',
            codeNumber: '',
            description: '',
            centralAmount: 0,
            stateAmount: 0,
            othersAmount: 0,
            grievances: 0,
            hlcRegNo: '',
            paraStatus: 'PENDING',
            recoveryAmount: 0,
        });
    };
    
    const clearIssue = (index: number) => {
        const currentIssue = form.getValues(`paraParticulars.${index}`);
        update(index, {
            issueNumber: currentIssue.issueNumber,
            type: '',
            category: '',
            subCategory: '',
            codeNumber: '',
            description: '',
            centralAmount: 0,
            stateAmount: 0,
            othersAmount: 0,
            grievances: 0,
            hlcRegNo: '',
            paraStatus: 'PENDING',
            recoveryAmount: 0,
        });
    }

    const onSubmit = (data: PmaygFormValues) => {
        console.log(data);
        toast({
            title: "Form Submitted!",
            description: "PMAY-G data has been successfully recorded.",
        });
    };
  
    if (loading) return <div>Loading user data...</div>;

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
                                <CardDescription>Enter the details for Pradhan Mantri Awaas Yojana – Gramin audit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Section A */}
                                <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section A: BRP Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                       <FormField
                                            control={form.control}
                                            name="employeeCode"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Employee Code*</FormLabel>
                                                    <Popover open={isEmployeeCodeOpen} onOpenChange={setEmployeeCodeOpen}>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                                                    {field.value ? users.find(u => u.employeeCode === field.value)?.employeeCode : "Select Employee"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[300px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search employee..." />
                                                                <CommandEmpty>No employee found.</CommandEmpty>
                                                                <CommandList>
                                                                    <CommandGroup>
                                                                        {users.map((u) => (
                                                                            <CommandItem
                                                                                value={u.employeeCode}
                                                                                key={u.id}
                                                                                onSelect={() => {
                                                                                    form.setValue("employeeCode", u.employeeCode);
                                                                                    setEmployeeCodeOpen(false);
                                                                                }}
                                                                            >
                                                                                <Check className={cn("mr-2 h-4 w-4", u.employeeCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                                {u.employeeCode} - {u.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="contact" render={({ field }) => (<FormItem><FormLabel>Contact</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
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
                                         <FormField control={form.control} name="roundNo" render={({ field }) => (<FormItem><FormLabel>Round No.*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Round" /></SelectTrigger></FormControl><SelectContent>{['0', 'Pilot - 1', ...Array.from({length: 30}, (_, i) => (i + 1).toString())].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
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

                                 {/* Sections C, D, E */}
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                     <div className="space-y-6">
                                         <Card>
                                             <CardHeader><CardTitle>Section C: Verification Details</CardTitle></CardHeader>
                                             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <FormField control={form.control} name="totalHouses" render={({ field }) => (<FormItem><FormLabel>Total Houses*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="housesVisited" render={({ field }) => (<FormItem><FormLabel>No. of Houses Visited*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="housesNotVisited" render={({ field }) => (<FormItem><FormLabel>No. of Houses Not Visited*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="firstInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 1st Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="secondInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 2nd Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="thirdInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 3rd Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="fourthInstallment" render={({ field }) => (<FormItem><FormLabel>No. of 4th Installments*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="notCompletedAfterFourth" render={({ field }) => (<FormItem><FormLabel>Houses Not Completed After 4th*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                             </CardContent>
                                         </Card>
                                          <Card>
                                             <CardHeader><CardTitle>Section D: Panchayat Summary</CardTitle></CardHeader>
                                             <CardContent className="space-y-4">
                                                 <FormField control={form.control} name="newBeneficiaryDecision" render={({ field }) => (<FormItem><FormLabel>NEW Beneficiary GS Decision*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="projectDeficiencies" render={({ field }) => (<FormItem><FormLabel>Project Deficiencies*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="specialRemarks" render={({ field }) => (<FormItem><FormLabel>Special Remarks*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                                 <FormField control={form.control} name="auditOutcome" render={({ field }) => (<FormItem><FormLabel>Outcome of Audit*</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                             </CardContent>
                                         </Card>
                                     </div>
                                      <Card>
                                        <CardHeader><CardTitle>Section E: Panchayat Verification Analysis</CardTitle></CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-muted-foreground mb-2">A. As per MIS Report</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                     <FormField control={form.control} name="seccCount" render={({ field }) => (<FormItem><FormLabel>SECC List Count*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name="seccNonRejected" render={({ field }) => (<FormItem><FormLabel>SECC Non-Rejected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name="seccSelected" render={({ field }) => (<FormItem><FormLabel>SECC Selected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name="awaasPlusCount" render={({ field }) => (<FormItem><FormLabel>Awaas+ List Count*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name="awaasPlusSelected" render={({ field }) => (<FormItem><FormLabel>Awaas+ Selected*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name="totalSelectedMIS" render={({ field }) => (<FormItem><FormLabel>Total Selected (MIS)</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-muted-foreground mb-2">B. Field Verification Data</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="beneficiariesInterviewed" render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries Interviewed*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="notInterviewedButVisited" render={({ field }) => (<FormItem><FormLabel>Not Interviewed but House Visited*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="couldNotIdentify" render={({ field }) => (<FormItem><FormLabel>Could Not Identify*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="totalVerifiedField" render={({ field }) => (<FormItem><FormLabel>Total Verified (Field)</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-muted-foreground mb-2">C. Format 3 – SECC Beneficiaries in Kutcha Houses</h4>
                                                <FormField control={form.control} name="seccInKutcha" render={({ field }) => (<FormItem><FormLabel>Count of SECC-selected beneficiaries still in Kutcha Houses*</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            </div>
                                        </CardContent>
                                     </Card>
                                 </div>
                                
                                {/* Section F */}
                                <Card>
                                    <CardHeader><CardTitle>Section F: Report Upload</CardTitle></CardHeader>
                                    <CardContent>
                                         <FormField control={form.control} name="reportFile" render={({ field }) => (
                                            <FormItem><FormLabel>Upload Report (PDF format, max 50MB)</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={handleFileChange} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                         {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
                                    </CardContent>
                                </Card>
                                
                                 {/* Section G */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Section G: Para Particulars</CardTitle>
                                            <CardDescription>Add and manage individual issues found during the audit.</CardDescription>
                                        </div>
                                        <Button type="button" onClick={addIssue}><PlusCircle className="mr-2"/>Add Issue</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {fields.length === 0 && (
                                            <div className="text-center text-muted-foreground py-8">No issues added yet.</div>
                                        )}
                                        {fields.map((field, index) => {
                                            const selectedType = form.watch(`paraParticulars.${index}.type`);
                                            const selectedCategory = form.watch(`paraParticulars.${index}.category`);
                                            
                                            const categories = Array.from(new Set(MOCK_PMAYG_DATA.filter(d => d.type === selectedType).map(d => d.category)));
                                            const subCategories = MOCK_PMAYG_DATA.filter(d => d.type === selectedType && d.category === selectedCategory);
                                            
                                            return (
                                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-slate-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <FormField control={form.control} name={`paraParticulars.${index}.issueNumber`} render={({ field }) => (<FormItem><FormLabel>Issue No.</FormLabel><FormControl><Input readOnly {...field} className="bg-muted"/></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name={`paraParticulars.${index}.codeNumber`} render={({ field }) => (<FormItem><FormLabel>Code No.</FormLabel><FormControl><Input readOnly {...field} className="bg-muted"/></FormControl></FormItem>)} />
                                                    <Controller control={form.control} name={`paraParticulars.${index}.type`} render={({ field }) => (
                                                        <FormItem><FormLabel>Type</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`paraParticulars.${index}.category`, ''); form.setValue(`paraParticulars.${index}.subCategory`, ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent>{uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>
                                                    )} />
                                                     <Controller control={form.control} name={`paraParticulars.${index}.category`} render={({ field }) => (
                                                        <FormItem className="lg:col-span-2"><FormLabel>Category</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`paraParticulars.${index}.subCategory`, ''); }} value={field.value} disabled={!selectedType}><FormControl><SelectTrigger className="h-auto min-h-10 whitespace-normal text-left"><SelectValue placeholder="Select Category"/></SelectTrigger></FormControl><SelectContent className="w-full md:w-[500px] lg:w-[600px]">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>
                                                    )} />
                                                     <Controller
                                                      control={form.control}
                                                      name={`paraParticulars.${index}.subCategory`}
                                                      render={({ field }) => (
                                                        <FormItem className="lg:col-span-4">
                                                          <FormLabel>Sub-Category</FormLabel>
                                                          <Select
                                                            onValueChange={(value) => {
                                                              field.onChange(value);
                                                              const code = subCategories.find(d => d.subCategory === value)?.codeNumber || '';
                                                              form.setValue(`paraParticulars.${index}.codeNumber`, code);
                                                            }}
                                                            value={field.value || ''}
                                                            disabled={!selectedCategory}
                                                          >
                                                            <FormControl>
                                                              <SelectTrigger className="h-auto min-h-16 whitespace-normal text-left">
                                                                <SelectValue placeholder="Select Sub-Category" />
                                                              </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                                              {subCategories.map(sc => (
                                                                <SelectItem key={sc.codeNumber} value={sc.subCategory} className="whitespace-normal">
                                                                  {sc.subCategory}
                                                                </SelectItem>
                                                              ))}
                                                            </SelectContent>
                                                          </Select>
                                                          <FormMessage />
                                                        </FormItem>
                                                      )}
                                                    />

                                                    <FormField control={form.control} name={`paraParticulars.${index}.description`} render={({ field }) => (<FormItem className="lg:col-span-4"><FormLabel>Description* (Max 1000 chars)</FormLabel><FormControl><Textarea {...field} className="h-24"/></FormControl><FormMessage/></FormItem>)} />
                                                    <FormField control={form.control} name={`paraParticulars.${index}.centralAmount`} render={({ field }) => (<FormItem><FormLabel>Central Amt.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name={`paraParticulars.${index}.stateAmount`} render={({ field }) => (<FormItem><FormLabel>State Amt.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name={`paraParticulars.${index}.othersAmount`} render={({ field }) => (<FormItem><FormLabel>Others Amt.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name={`paraParticulars.${index}.grievances`} render={({ field }) => (<FormItem><FormLabel>No. of Grievances</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <Controller control={form.control} name={`paraParticulars.${index}.hlcRegNo`} render={({ field }) => (
                                                        <FormItem><FormLabel>HLC Reg No.</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select HLC No."/></SelectTrigger></FormControl><SelectContent>{pmayHlcItems.map(item => <SelectItem key={item.id} value={item.regNo}>{item.regNo}</SelectItem>)}</SelectContent></Select></FormItem>
                                                     )} />
                                                     <Controller control={form.control} name={`paraParticulars.${index}.paraStatus`} render={({ field }) => (
                                                        <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent></Select></FormItem>
                                                     )} />
                                                     <FormField control={form.control} name={`paraParticulars.${index}.recoveryAmount`} render={({ field }) => (<FormItem><FormLabel>Recovery Amt.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2 border-t">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => clearIssue(index)}>Clear</Button>
                                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2/></Button>
                                                </div>
                                            </div>
                                            );
                                        })}
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
