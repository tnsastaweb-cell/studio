
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, getYear, isWithinInterval } from 'date-fns';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useUsers, User } from '@/services/users';
import { useVRPs, Vrp } from '@/services/vrp';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { MOCK_MGNREGS_DATA, MgnregsData } from '@/services/mgnregs';
import { useHlc } from '@/services/hlc';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Upload, ChevronsUpDown, Check } from 'lucide-react';
import Link from 'next/link';

const paraParticularsSchema = z.object({
  issueNumber: z.string().min(1, "Issue No. is required."),
  type: z.string().min(1, "Type is required."),
  category: z.string().min(1, "Category is required."),
  subCategory: z.string().min(1, "Sub-category is required."),
  codeNumber: z.string(),
  grievances: z.coerce.number().optional(),
  beneficiaries: z.coerce.number().optional(),
  cases: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  recoveredAmount: z.coerce.number().optional(),
  hlcRegNo: z.string().optional(),
  paraStatus: z.enum(['PENDING', 'CLOSED']),
  hlcRecoveryAmount: z.coerce.number().optional(),
});


const mgnregsFormSchema = z.object({
  // Section A - BRP Details
  brpEmployeeCode: z.string().min(1, "Employee Code is required."),
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
  expenditureYear: z.string(),
  auditYear: z.string(),
  observer: z.enum(['yes', 'no']),
  observerName: z.string().optional(),
  coram: z.coerce.number().max(999, "Must be max 3 digits"),

  // Section C - VRP Details
  vrpSearchType: z.enum(['employeeCode', 'contactNumber']).optional(),
  vrpSearchValue: z.string().optional(),
  vrpEmployeeCode: z.string().optional(),
  vrpName: z.string().optional(),
  vrpContactNumber: z.string().optional(),
  vrpDistrict: z.string().optional(),
  vrpBlock: z.string().optional(),
  vrpPanchayat: z.string().optional(),

  // Section D - Verification Details
  pvtIndividualLandWorks: z.coerce.number().optional(),
  pvtIndividualLandAmount: z.coerce.number().optional(),
  pvtIndividualAssetsWorks: z.coerce.number().optional(),
  pvtIndividualAssetsAmount: z.coerce.number().optional(),
  pubCommunityLandWorks: z.coerce.number().optional(),
  pubCommunityLandAmount: z.coerce.number().optional(),
  pubCommunityAssetsWorks: z.coerce.number().optional(),
  pubCommunityAssetsAmount: z.coerce.number().optional(),
  skilledSemiSkilledAmount: z.coerce.number().optional(),
  materialAmount: z.coerce.number().optional(),
  totalWorks: z.coerce.number().optional(),
  totalAmount: z.coerce.number().optional(),
  worksVerified: z.coerce.number().optional(),
  householdsWorked: z.coerce.number().optional(),
  householdsVerified: z.coerce.number().optional(),

  // Section E - Report
  reportFile: z.any().optional(),
  
  // Section F - Para Particulars
  paraParticulars: z.array(paraParticularsSchema).optional(),
});

type MgnregsFormValues = z.infer<typeof mgnregsFormSchema>;

const uniqueMgnregsTypes = Array.from(new Set(MOCK_MGNREGS_DATA.map(d => d.type)));

export default function MgnregsDataEntryPage() {
    const { user, loading } = useAuth();
    const { users } = useUsers();
    const { vrps } = useVRPs();
    const { toast } = useToast();
    const { hlcItems } = useHlc();

    const [isBrpEmployeeCodeOpen, setBrpEmployeeCodeOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const mgnregsHlcItems = useMemo(() => hlcItems.filter(item => item.scheme === 'MGNREGS'), [hlcItems]);

    const form = useForm<MgnregsFormValues>({
        resolver: zodResolver(mgnregsFormSchema),
        defaultValues: {
            expenditureYear: '2022-2023',
            observer: 'no',
            paraParticulars: [],
            pvtIndividualLandWorks: 0, pvtIndividualLandAmount: 0,
            pvtIndividualAssetsWorks: 0, pvtIndividualAssetsAmount: 0,
            pubCommunityLandWorks: 0, pubCommunityLandAmount: 0,
            pubCommunityAssetsWorks: 0, pubCommunityAssetsAmount: 0,
            skilledSemiSkilledAmount: 0, materialAmount: 0,
            totalWorks: 0, totalAmount: 0,
            worksVerified: 0, householdsWorked: 0, householdsVerified: 0,
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "paraParticulars",
    });

    const watchedBrpCode = form.watch("brpEmployeeCode");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedSgsDate = form.watch("sgsDate");

    const watchedVerificationFields = form.watch([
        "pvtIndividualLandWorks", "pvtIndividualLandAmount",
        "pvtIndividualAssetsWorks", "pvtIndividualAssetsAmount",
        "pubCommunityLandWorks", "pubCommunityLandAmount",
        "pubCommunityAssetsWorks", "pubCommunityAssetsAmount",
        "skilledSemiSkilledAmount", "materialAmount"
    ]);
    
     useEffect(() => {
        const [
            pvtIndividualLandWorks, pvtIndividualLandAmount,
            pvtIndividualAssetsWorks, pvtIndividualAssetsAmount,
            pubCommunityLandWorks, pubCommunityLandAmount,
            pubCommunityAssetsWorks, pubCommunityAssetsAmount,
            skilledSemiSkilledAmount, materialAmount
        ] = watchedVerificationFields.map(v => Number(v) || 0);

        const totalWorks = pvtIndividualLandWorks + pvtIndividualAssetsWorks + pubCommunityLandWorks + pubCommunityAssetsWorks;
        const totalAmount = pvtIndividualLandAmount + pvtIndividualAssetsAmount + pubCommunityLandAmount + pubCommunityAssetsAmount + skilledSemiSkilledAmount + materialAmount;
        
        form.setValue('totalWorks', totalWorks);
        form.setValue('totalAmount', totalAmount);
    }, [watchedVerificationFields, form]);

    const staffList = useMemo(() => {
        const targetRoles: User['designation'][] = ['BRP', 'DRP', 'DRP I/C', 'ADMIN', 'CREATOR', 'CONSULTANT'];
        return users.filter(u => targetRoles.includes(u.designation));
    }, [users]);
    
    useEffect(() => {
        if (watchedBrpCode) {
            const selectedUser = users.find(u => u.employeeCode === watchedBrpCode);
            if (selectedUser) {
                const presentStation = selectedUser.brpWorkHistory?.find(h => h.station === 'present') ||
                                     selectedUser.drpWorkHistory?.find(h => h.station === 'present');
                form.setValue('brpName', selectedUser.name);
                form.setValue('brpContact', selectedUser.mobileNumber);
                form.setValue('brpDistrict', presentStation?.district || selectedUser.district || '');
                form.setValue('brpBlock', (presentStation as any)?.block || selectedUser.block || '');
            }
        }
    }, [watchedBrpCode, users, form]);
    
    const watchedVrpSearchType = form.watch("vrpSearchType");
    const watchedVrpSearchValue = form.watch("vrpSearchValue");

    useEffect(() => {
        let vrp: Vrp | undefined;
        if(watchedVrpSearchType === 'employeeCode') {
            vrp = vrps.find(v => v.employeeCode.toLowerCase() === watchedVrpSearchValue?.toLowerCase());
        } else if (watchedVrpSearchType === 'contactNumber') {
             vrp = vrps.find(v => v.contactNumber1 === watchedVrpSearchValue);
        }

        if (vrp) {
             form.setValue('vrpEmployeeCode', vrp.employeeCode);
             form.setValue('vrpName', vrp.name);
             form.setValue('vrpContactNumber', vrp.contactNumber1);
             form.setValue('vrpDistrict', vrp.district);
             form.setValue('vrpBlock', vrp.block);
             form.setValue('vrpPanchayat', vrp.panchayatName);
        } else {
             form.setValue('vrpEmployeeCode', '');
             form.setValue('vrpName', '');
             form.setValue('vrpContactNumber', '');
             form.setValue('vrpDistrict', '');
             form.setValue('vrpBlock', '');
             form.setValue('vrpPanchayat', '');
        }

    }, [watchedVrpSearchValue, watchedVrpSearchType, vrps, form]);


    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    useEffect(() => {
        if(watchedPanchayat){
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        } else {
            form.setValue('lgdCode', '');
        }
    }, [form, watchedPanchayat]);
    
    useEffect(() => {
        if (watchedSgsDate) {
            const year = getYear(watchedSgsDate);
            const fiscalYearStart = new Date(year, 3, 1);
            const auditYear = isWithinInterval(watchedSgsDate, { start: fiscalYearStart, end: new Date(year + 1, 2, 31) }) 
                ? `${year}-${year + 1}`
                : `${year - 1}-${year}`;
            form.setValue('auditYear', auditYear);
        }
    }, [watchedSgsDate, form]);
    
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
        append({
            issueNumber: '', type: '', category: '', subCategory: '', codeNumber: '', paraStatus: 'PENDING',
            grievances: 0, beneficiaries: 0, cases: 0, amount: 0, recoveredAmount: 0, hlcRegNo: '', hlcRecoveryAmount: 0,
        });
    };

    const clearIssue = (index: number) => {
        update(index, {
            issueNumber: '', type: '', category: '', subCategory: '', codeNumber: '',
            grievances: 0, beneficiaries: 0, cases: 0, amount: 0, recoveredAmount: 0, hlcRegNo: '', paraStatus: 'PENDING', hlcRecoveryAmount: 0,
        });
    };

    const onSubmit = (data: MgnregsFormValues) => {
        console.log(data);
        toast({
            title: "Form Submitted!",
            description: "MGNREGS data has been successfully recorded.",
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
                                <CardTitle>MGNREGS Data Entry</CardTitle>
                                <CardDescription>Enter the details for Mahatma Gandhi National Rural Employment Guarantee Scheme audit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Section A */}
                                <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section A: BRP Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        <FormField control={form.control} name="brpEmployeeCode" render={({ field }) => (
                                            <FormItem className="flex flex-col"><FormLabel>Employee Code*</FormLabel>
                                                <Popover open={isBrpEmployeeCodeOpen} onOpenChange={setBrpEmployeeCodeOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl><Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                                            {field.value ? staffList.find(u => u.employeeCode === field.value)?.employeeCode : "Select Employee"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button></FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0">
                                                        <Command><CommandInput placeholder="Search employee..." /><CommandEmpty>No employee found.</CommandEmpty>
                                                            <CommandList><CommandGroup>
                                                                {staffList.map((u) => (<CommandItem value={u.employeeCode} key={u.id} onSelect={() => { form.setValue("brpEmployeeCode", u.employeeCode); setBrpEmployeeCodeOpen(false);}}>
                                                                    <Check className={cn("mr-2 h-4 w-4", u.employeeCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {u.employeeCode} - {u.name}
                                                                </CommandItem>))}
                                                            </CommandGroup></CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover><FormMessage />
                                            </FormItem>
                                        )} />
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
                                         <FormField control={form.control} name="roundNo" render={({ field }) => (<FormItem><FormLabel>Round No.*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Round" /></SelectTrigger></FormControl><SelectContent>{['Pilot - 1','Pilot - 2','Pilot - 3','Pilot - 4','Pilot - 5', '0', ...Array.from({length: 35}, (_, i) => (i + 1).toString())].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="auditStartDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Audit Start Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="auditEndDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Audit End Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="sgsDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>SGS Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="expenditureYear" render={({ field }) => (<FormItem><FormLabel>Expenditure Year*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl><SelectContent><SelectItem value="2022-2023">2022-2023</SelectItem><SelectItem value="2023-2024">2023-2024</SelectItem><SelectItem value="2024-2025">2024-2025</SelectItem></SelectContent></Select></FormItem>)} />
                                         <FormField control={form.control} name="auditYear" render={({ field }) => (<FormItem><FormLabel>Audit Year*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="observer" render={({ field }) => (<FormItem><FormLabel>Observer*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                         {form.watch('observer') === 'yes' && <FormField control={form.control} name="observerName" render={({ field }) => (<FormItem><FormLabel>Observer Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />}
                                         <FormField control={form.control} name="coram" render={({ field }) => (<FormItem><FormLabel>CORAM (Max 3 digits)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     </div>
                                </section>
                                
                                {/* Section C */}
                                <section>
                                     <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section C: VRP Details</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                         <FormField control={form.control} name="vrpSearchType" render={({ field }) => (
                                             <FormItem><FormLabel>Search VRP by</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="employeeCode">Employee Code</SelectItem><SelectItem value="contactNumber">Contact Number</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                         )} />
                                         <FormField control={form.control} name="vrpSearchValue" render={({ field }) => (<FormItem><FormLabel>Search Value</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                                        <FormField control={form.control} name="vrpEmployeeCode" render={({ field }) => (<FormItem><FormLabel>VRP Employee Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="vrpName" render={({ field }) => (<FormItem><FormLabel>VRP Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="vrpContactNumber" render={({ field }) => (<FormItem><FormLabel>VRP Contact</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="vrpDistrict" render={({ field }) => (<FormItem><FormLabel>VRP District</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="vrpBlock" render={({ field }) => (<FormItem><FormLabel>VRP Block</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="vrpPanchayat" render={({ field }) => (<FormItem><FormLabel>VRP Panchayat</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                     </div>
                                </section>
                                 {/* Section D */}
                                <section>
                                    <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Section D: Verification Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="lg:col-span-2 p-4 border rounded-md">
                                             <h4 className="font-semibold mb-2">Private</h4>
                                             <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <FormField control={form.control} name="pvtIndividualLandWorks" render={({ field }) => (<FormItem><FormLabel>Individual Land (Earth) - No. of Works</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                  <FormField control={form.control} name="pvtIndividualLandAmount" render={({ field }) => (<FormItem><FormLabel>Individual Land (Earth) - Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <FormField control={form.control} name="pvtIndividualAssetsWorks" render={({ field }) => (<FormItem><FormLabel>Individual Assets (Construction) - No. of Works</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                  <FormField control={form.control} name="pvtIndividualAssetsAmount" render={({ field }) => (<FormItem><FormLabel>Individual Assets (Construction) - Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                             </div>
                                        </div>
                                         <div className="lg:col-span-2 p-4 border rounded-md">
                                             <h4 className="font-semibold mb-2">Public</h4>
                                             <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <FormField control={form.control} name="pubCommunityLandWorks" render={({ field }) => (<FormItem><FormLabel>Community Land (Earth) - No. of Works</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                  <FormField control={form.control} name="pubCommunityLandAmount" render={({ field }) => (<FormItem><FormLabel>Community Land (Earth) - Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <FormField control={form.control} name="pubCommunityAssetsWorks" render={({ field }) => (<FormItem><FormLabel>Community Assets (Construction) - No. of Works</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                  <FormField control={form.control} name="pubCommunityAssetsAmount" render={({ field }) => (<FormItem><FormLabel>Community Assets (Construction) - Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                             </div>
                                        </div>
                                        <FormField control={form.control} name="skilledSemiSkilledAmount" render={({ field }) => (<FormItem><FormLabel>Skilled/Semi Skilled - Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="materialAmount" render={({ field }) => (<FormItem><FormLabel>Material Expenditure Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="totalWorks" render={({ field }) => (<FormItem><FormLabel>Total Works</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="totalAmount" render={({ field }) => (<FormItem><FormLabel>Total Expenditure Amount</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="worksVerified" render={({ field }) => (<FormItem><FormLabel>Number of Works Verified</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="householdsWorked" render={({ field }) => (<FormItem><FormLabel>Total House Holds Worked</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="householdsVerified" render={({ field }) => (<FormItem><FormLabel>Total House Holds Verified</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                    </div>
                                </section>
                                 {/* Section E */}
                                <Card>
                                    <CardHeader><CardTitle>Section E: Report Upload</CardTitle></CardHeader>
                                    <CardContent>
                                         <FormField control={form.control} name="reportFile" render={({ field }) => (
                                            <FormItem><FormLabel>Upload Report (PDF format, max 50MB)</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={handleFileChange} /></FormControl><FormMessage /></FormItem>
                                         )} />
                                         {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
                                    </CardContent>
                                </Card>
                                
                                  {/* Section F */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div><CardTitle>Section F: Para Particulars</CardTitle><CardDescription>Add and manage individual issues found during the audit.</CardDescription></div>
                                        <Button type="button" onClick={addIssue}><PlusCircle className="mr-2"/>Add Issue</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {fields.length === 0 && (<div className="text-center text-muted-foreground py-8">No issues added yet.</div>)}
                                        {fields.map((field, index) => {
                                            const selectedType = form.watch(`paraParticulars.${index}.type`);
                                            const selectedCategory = form.watch(`paraParticulars.${index}.category`);
                                            
                                            const categories = Array.from(new Set(MOCK_MGNREGS_DATA.filter(d => d.type === selectedType).map(d => d.category)));
                                            const subCategories = MOCK_MGNREGS_DATA.filter(d => d.type === selectedType && d.category === selectedCategory);
                                            
                                            return (
                                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-slate-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <FormField control={form.control} name={`paraParticulars.${index}.issueNumber`} render={({ field }) => (<FormItem><FormLabel>Issue No.</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                    <Controller control={form.control} name={`paraParticulars.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`paraParticulars.${index}.category`, ''); form.setValue(`paraParticulars.${index}.subCategory`, ''); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent>{uniqueMgnregsTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                                     <Controller control={form.control} name={`paraParticulars.${index}.category`} render={({ field }) => (<FormItem className="lg:col-span-2"><FormLabel>Category</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue(`paraParticulars.${index}.subCategory`, ''); }} value={field.value} disabled={!selectedType}><FormControl><SelectTrigger><SelectValue placeholder="Select Category"/></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                                    <Controller
                                                        control={form.control}
                                                        name={`paraParticulars.${index}.subCategory`}
                                                        render={({ field }) => (
                                                            <FormItem className="lg:col-span-3">
                                                                <FormLabel>Sub-Category</FormLabel>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        const code = subCategories.find(d => d.subCategory === value)?.codeNumber || '';
                                                                        form.setValue(`paraParticulars.${index}.codeNumber`, code);
                                                                    }}
                                                                    value={field.value}
                                                                    disabled={!selectedCategory}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-auto min-h-10 whitespace-normal text-left">
                                                                            <SelectValue placeholder="Select Sub-Category" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                                                        {subCategories.map(sc => (
                                                                            <SelectItem key={sc.codeNumber} value={sc.subCategory} className="whitespace-normal h-auto py-2">
                                                                                {sc.subCategory}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField control={form.control} name={`paraParticulars.${index}.codeNumber`} render={({ field }) => (<FormItem><FormLabel>Code No.</FormLabel><FormControl><Input readOnly {...field} className="bg-muted"/></FormControl></FormItem>)} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                     {selectedType === 'GR - Grievances' ? (
                                                        <>
                                                            <FormField control={form.control} name={`paraParticulars.${index}.grievances`} render={({ field }) => (<FormItem><FormLabel>No. of Grievances</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                            <FormField control={form.control} name={`paraParticulars.${index}.beneficiaries`} render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                        </>
                                                     ) : (
                                                        <FormField control={form.control} name={`paraParticulars.${index}.cases`} render={({ field }) => (<FormItem><FormLabel>No. of Cases</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     )}
                                                     <FormField control={form.control} name={`paraParticulars.${index}.amount`} render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                     <FormField control={form.control} name={`paraParticulars.${index}.recoveredAmount`} render={({ field }) => (<FormItem><FormLabel>Recovered Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                      <Controller control={form.control} name={`paraParticulars.${index}.hlcRegNo`} render={({ field }) => (<FormItem><FormLabel>HLC Reg No.</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select HLC No."/></SelectTrigger></FormControl><SelectContent>{mgnregsHlcItems.map(item => <SelectItem key={item.id} value={item.regNo}>{item.regNo}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                                      <Controller control={form.control} name={`paraParticulars.${index}.paraStatus`} render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent></Select></FormItem>)} />
                                                      <FormField control={form.control} name={`paraParticulars.${index}.hlcRecoveryAmount`} render={({ field }) => (<FormItem><FormLabel>HLC Recovery Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />

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
                                    <Button type="submit" size="lg">Submit MGNREGS Report</Button>
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

