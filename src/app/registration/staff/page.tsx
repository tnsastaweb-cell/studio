
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, Upload, Eye, FileUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { DISTRICTS } from '@/services/district-offices';
import { MOCK_ULBS, ULB_TYPES } from '@/services/ulb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const fileSchema = z.any()
  .refine(files => files?.length === 1, 'File is required.').optional().nullable()
  .refine(files => !files || files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`).optional().nullable();

const medicalFileSchema = z.any()
  .refine(files => files?.length === 1, 'File is required.').optional().nullable()
  .refine(files => !files || files?.[0]?.size <= 20 * 1024 * 1024, `Max file size is 20MB.`).optional().nullable();

const academicDetailSchema = z.object({
  course: z.string().min(1, "Course is required"),
  institution: z.string().min(1, "Institution is required"),
  board: z.string().min(1, "Board/University is required"),
  fromYear: z.string().min(4, "Start year is required"),
  toYear: z.string().min(4, "End year is required"),
  aggregate: z.coerce.number().min(0, "Must be positive").max(100, "Cannot exceed 100"),
  certificate: fileSchema,
});

const workExperienceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  natureOfJob: z.string().min(1, "Job nature is required"),
  from: z.date({ required_error: "Start date is required" }),
  to: z.date({ required_error: "End date is required" }),
  certificate: fileSchema,
});

const skillSchema = z.object({
  skill: z.string().min(1, "Skill cannot be empty"),
});

const trainingSchema = z.object({
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  location: z.string().min(1, "Location is required"),
  trainingName: z.string().min(1, "Training name is required"),
  grade: z.string().optional(),
});

const auditSchema = z.object({
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  location: z.string().min(1, "Location is required"),
  schemeName: z.string().min(1, "Scheme name is required"),
});

const stateOfficeActivitySchema = z.object({
  year: z.string().min(4, "Year is required"),
  workParticulars: z.string().min(1, "Work particulars are required"),
});

const workedStationSchema = z.object({
    district: z.string().min(1, "District is required"),
    block: z.string().optional(),
    fromDate: z.date({ required_error: "From date is required" }),
    toDate: z.date({ required_error: "To date is required" }),
});

const staffFormSchema = z.object({
    photo: z.any().refine(files => files?.length === 1, 'Photo is required.'),
    recruitmentType: z.enum(['direct', 'retired'], { required_error: "Recruitment type is required" }),
    employeeCode: z.string().min(1, "Please select an employee code"),
    name: z.string(),
    email: z.string(),
    contactNumber1: z.string(),
    locationType: z.enum(['rural', 'urban'], { required_error: "Location type is required" }),
    ruralDistrict: z.string().optional(),
    ruralBlock: z.string().optional(),
    ruralPanchayat: z.string().optional(),
    urbanDistrict: z.string().optional(),
    urbanBodyType: z.enum(ULB_TYPES).optional(),
    urbanBodyName: z.string().optional(),
    fullAddress: z.string().min(1, "Address is required"),
    pincode: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    spouseName: z.string().optional(),
    religion: z.enum(['Hindu', 'Muslim', 'Christian', 'Other'], { required_error: "Religion is required" }),
    caste: z.string().min(1, "Caste is required"),
    dob: z.date({ required_error: "Date of birth is required" }),
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: "Gender is required" }),
    femaleType: z.enum(['single_women', 'widow', 'none']).optional(),
    differentlyAbled: z.enum(['yes', 'no'], { required_error: "This field is required" }),
    disabilityCertificate: fileSchema.optional(),
    healthIssues: z.enum(['normal', 'minor', 'major'], { required_error: "Health status is required" }),
    issueDetails: z.string().optional(),
    medicalCertificate: medicalFileSchema.optional(),
    contactNumber2: z.string().optional(),
    personalEmail: z.string().email("Invalid email format"),
    eportalEmail: z.string().email("Invalid email format"),
    bankName: z.string().min(1, "Bank name is required"),
    branchName: z.string().min(1, "Branch name is required"),
    accountNumber: z.string().regex(/^\d+$/, "Account number must be digits only"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    aadhaar: z.string().regex(/^\d{12}$/, "Must be 12 digits"),
    aadhaarUpload: z.any().refine(files => files?.length === 1, 'Aadhaar copy is required.'),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
    panUpload: z.any().refine(files => files?.length === 1, 'PAN copy is required.'),
    uan: z.string().optional(),
    pfmsId: z.string().min(1, "PFMS ID is required"),
    academics: z.array(academicDetailSchema).min(1, "At least one academic detail is required"),
    workExperiences: z.array(workExperienceSchema),
    skills: z.array(skillSchema).min(1, "At least one skill is required"),
    joiningDate: z.date().optional(),
    brpWorkedStations: z.array(workedStationSchema).optional(),
    drpWorkedStations: z.array(workedStationSchema).optional(),
    isDrpIC: z.enum(['yes', 'no']).optional(),
    drpICWorkedStations: z.array(workedStationSchema).optional(),
    trainingTaken: z.enum(['yes', 'no']).optional(),
    trainingsTakenDetails: z.array(trainingSchema).optional(),
    trainingGiven: z.enum(['yes', 'no']).optional(),
    trainingsGivenDetails: z.array(trainingSchema).optional(),
    pilotAudit: z.enum(['yes', 'no']).optional(),
    pilotAuditDetails: z.array(auditSchema).optional(),
    stateOfficeActivities: z.enum(['yes', 'no']).optional(),
    stateOfficeActivityDetails: z.array(stateOfficeActivitySchema).optional(),
    disclaimer: z.boolean().refine(val => val === true, "You must accept the disclaimer"),
}).refine(data => data.locationType !== 'rural' || (data.ruralDistrict && data.ruralBlock && data.ruralPanchayat), {
    message: "Rural location details are required", path: ["ruralPanchayat"]
}).refine(data => data.locationType !== 'urban' || (data.urbanDistrict && data.urbanBodyType && data.urbanBodyName), {
    message: "Urban location details are required", path: ["urbanBodyName"]
}).refine(data => data.gender !== 'Female' || data.femaleType, {
    message: "Please specify type for Female gender", path: ["femaleType"]
}).refine(data => data.differentlyAbled !== 'yes' || data.disabilityCertificate, {
    message: "Certificate is required for 'Yes'", path: ["disabilityCertificate"]
}).refine(data => data.healthIssues === 'normal' || data.issueDetails, {
    message: "Please provide details for minor/major health issues", path: ["issueDetails"]
}).refine(data => data.healthIssues !== 'major' || data.medicalCertificate, {
    message: "Medical certificate is required for 'Major' health issues", path: ["medicalCertificate"]
});


type StaffFormValues = z.infer<typeof staffFormSchema>;

type DynamicTableProps = {
    name: any;
    control: any;
    columns: { header: string; render: (index: number) => React.ReactNode, className?: string }[];
    appendValues: any;
};

const DynamicTable: React.FC<DynamicTableProps> = ({ name, control, columns, appendValues }) => {
    const { fields, append, remove } = useFieldArray({ control, name });
    
    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Sl.No</TableHead>
                            {columns.map(col => <TableHead key={col.header} className={col.className}>{col.header}</TableHead>)}
                            <TableHead className="w-20 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                           <TableRow key={field.id}>
                                <TableCell>{index + 1}</TableCell>
                                {columns.map(col => <TableCell key={col.header}>{col.render(index)}</TableCell>)}
                                <TableCell className="text-right">
                                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button type="button" variant="outline" onClick={() => append(appendValues)}><PlusCircle className="mr-2" /> Add Row</Button>
        </div>
    );
};

export default function StaffRegistrationPage() {
    const { toast } = useToast();
    const { user: loggedInUser, loading: authLoading } = useAuth();
    const { users, loading: usersLoading } = useUsers();
    
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [previewData, setPreviewData] = useState<StaffFormValues | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            photo: null,
            recruitmentType: undefined,
            employeeCode: "",
            name: "",
            email: "",
            contactNumber1: "",
            locationType: undefined,
            ruralDistrict: "",
            ruralBlock: "",
            ruralPanchayat: "",
            urbanDistrict: "",
            urbanBodyType: undefined,
            urbanBodyName: "",
            fullAddress: "",
            pincode: "",
            fatherName: "",
            motherName: "",
            spouseName: "",
            religion: undefined,
            caste: "",
            dob: undefined,
            gender: undefined,
            femaleType: undefined,
            differentlyAbled: undefined,
            disabilityCertificate: null,
            healthIssues: undefined,
            issueDetails: "",
            medicalCertificate: null,
            contactNumber2: "",
            personalEmail: "",
            eportalEmail: "",
            bankName: "",
            branchName: "",
            accountNumber: "",
            ifscCode: "",
            aadhaar: "",
            aadhaarUpload: null,
            pan: "",
            panUpload: null,
            uan: "",
            pfmsId: "",
            academics: [], 
            workExperiences: [], 
            skills: [],
            joiningDate: undefined,
            brpWorkedStations: [],
            drpWorkedStations: [],
            isDrpIC: 'no',
            drpICWorkedStations: [],
            trainingTaken: 'no',
            trainingsTakenDetails: [],
            trainingGiven: 'no',
            trainingsGivenDetails: [],
            pilotAudit: 'no',
            pilotAuditDetails: [],
            stateOfficeActivities: 'no',
            stateOfficeActivityDetails: [],
            disclaimer: false
        },
    });
    
    const watchedEmployeeCode = useWatch({ control: form.control, name: 'employeeCode' });
    const watchedLocationType = useWatch({ control: form.control, name: 'locationType' });
    const watchedRuralDistrict = useWatch({ control: form.control, name: 'ruralDistrict' });
    const watchedRuralBlock = useWatch({ control: form.control, name: 'ruralBlock' });
    const watchedUrbanDistrict = useWatch({ control: form.control, name: 'urbanDistrict' });
    const watchedUrbanType = useWatch({ control: form.control, name: 'urbanBodyType' });
    const watchedGender = useWatch({ control: form.control, name: 'gender' });
    const watchedDifferentlyAbled = useWatch({ control: form.control, name: 'differentlyAbled' });
    const watchedHealthIssues = useWatch({ control: form.control, name: 'healthIssues' });
    const watchedIsDrpIC = useWatch({ control: form.control, name: 'isDrpIC' });
    const watchedTrainingTaken = useWatch({ control: form.control, name: 'trainingTaken' });
    const watchedTrainingGiven = useWatch({ control: form.control, name: 'trainingGiven' });
    const watchedPilotAudit = useWatch({ control: form.control, name: 'pilotAudit' });
    const watchedStateOfficeActivities = useWatch({ control: form.control, name: 'stateOfficeActivities' });

    const eligibleUsers = useMemo(() => {
        if (!selectedRole) return [];
        return users.filter(u => u.designation === selectedRole);
    }, [selectedRole, users]);

    useEffect(() => {
        if (watchedEmployeeCode) {
            const selectedUser = users.find(u => u.employeeCode === watchedEmployeeCode);
            if (selectedUser) {
                form.setValue('name', selectedUser.name);
                form.setValue('contactNumber1', selectedUser.mobileNumber);
            }
        }
    }, [watchedEmployeeCode, users, form]);
    
    const ruralBlocks = useMemo(() => {
        if (!watchedRuralDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedRuralDistrict).map(p => p.block))).sort();
    }, [watchedRuralDistrict]);
    
    const ruralPanchayats = useMemo(() => {
        if (!watchedRuralBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedRuralBlock).sort((a,b) => a.name.localeCompare(b.name));
    }, [watchedRuralBlock]);
    
    const watchedPanchayatLGD = useWatch({ control: form.control, name: 'ruralPanchayat' });
    const lgdCode = useMemo(() => {
        if (!watchedPanchayatLGD) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayatLGD);
        return panchayat ? panchayat.lgdCode : '';
    }, [watchedPanchayatLGD]);

    const urbanBodies = useMemo(() => {
        if (!watchedUrbanDistrict || !watchedUrbanType) return [];
        return MOCK_ULBS.filter(u => u.district === watchedUrbanDistrict && u.type === watchedUrbanType);
    }, [watchedUrbanDistrict, watchedUrbanType])

    const calculateAge = (dob: Date | undefined) => {
        if (!dob) return '';
        return differenceInYears(new Date(), dob).toString();
    }
    
    const calculateDuration = (from: Date | undefined, to: Date | undefined) => {
        if (!from || !to || from > to) return 'N/A';
        const years = differenceInYears(to, from);
        const months = differenceInMonths(to, from) % 12;
        return `${years} year(s), ${months} month(s)`;
    }

    const onSubmit = (data: StaffFormValues) => {
        setPreviewData(data);
        console.log(data);
        toast({ title: "Form Data Prepared for Preview", description: "Please review all details before final submission." });
    };

    const handleFinalSubmit = () => {
        console.log("Final Submit:", previewData);
        toast({ title: "Form Submitted!", description: "Staff details have been saved successfully."});
        setPreviewData(null);
        form.reset();
        setSelectedRole('');
        setPhotoPreview(null);
    };

    const showConditionalTabs = ['BRP', 'DRP', 'DRP I/C'].includes(selectedRole);
    
    if (authLoading || usersLoading) return <p>Loading...</p>;
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Registration</CardTitle>
                        <CardDescription>Enter the details for the new staff member.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormItem>
                                        <FormLabel>Role/Designation*</FormLabel>
                                        <Select onValueChange={setSelectedRole} value={selectedRole}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a Role" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {['BRP', 'DRP'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                </div>
                                {selectedRole && (
                                    <Tabs defaultValue="basic-info" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                                            <TabsTrigger value="location-details">Location Details</TabsTrigger>
                                            <TabsTrigger value="family-details">Family Details</TabsTrigger>
                                            <TabsTrigger value="personal-details">Personal Details</TabsTrigger>
                                            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
                                            <TabsTrigger value="education-experience">Education & Experience</TabsTrigger>
                                            {showConditionalTabs && <TabsTrigger value="working-details">Working Details</TabsTrigger>}
                                            {showConditionalTabs && <TabsTrigger value="training-audit">Training & Audit</TabsTrigger>}
                                            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
                                        </TabsList>
                                        
                                         <TabsContent value="basic-info" className="pt-6">
                                            <Card>
                                                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                                        <FormField control={form.control} name="photo" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Photo Upload* (Max 5MB)</FormLabel>
                                                                <div className="flex items-center gap-4">
                                                                     <Avatar className="h-24 w-24 border">
                                                                        <AvatarImage src={photoPreview || undefined} />
                                                                        <AvatarFallback><Upload /></AvatarFallback>
                                                                    </Avatar>
                                                                    <FormControl>
                                                                        <Input type="file" accept="image/*" onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                if (file.size > 5 * 1024 * 1024) {
                                                                                    toast({ variant: 'destructive', title: 'File too large', description: 'Photo must be under 5MB.' });
                                                                                    return;
                                                                                }
                                                                                field.onChange(e.target.files);
                                                                                setPhotoPreview(URL.createObjectURL(file));
                                                                            }
                                                                        }} />
                                                                    </FormControl>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="recruitmentType" render={({ field }) => (
                                                            <FormItem><FormLabel>Recruitment Type*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                    <SelectContent><SelectItem value="direct">Direct</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent>
                                                                </Select><FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="employeeCode" render={({ field }) => (
                                                            <FormItem><FormLabel>Employee Code*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Employee Code" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{eligibleUsers.map(u => <SelectItem key={u.id} value={u.employeeCode}>{u.employeeCode}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage />
                                                            </FormItem>
                                                        )} />
                                                         <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem> )} />
                                                         <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                         <FormField control={form.control} name="contactNumber1" render={({ field }) => ( <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem> )} />
                                                    </div>
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="location-details" className="pt-6">
                                             <Card>
                                                <CardHeader><CardTitle>Location Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-4">
                                                    <FormField control={form.control} name="locationType" render={({ field }) => (
                                                        <FormItem><FormLabel>Type*</FormLabel>
                                                             <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                <SelectContent><SelectItem value="rural">Rural</SelectItem><SelectItem value="urban">Urban</SelectItem></SelectContent>
                                                            </Select><FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    {watchedLocationType === 'rural' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                             <FormField control={form.control} name="ruralDistrict" render={({ field }) => ( <FormItem><FormLabel>District*</FormLabel><Select onValueChange={(val) => { field.onChange(val); form.setValue('ruralBlock', ''); form.setValue('ruralPanchayat', ''); }} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                             <FormField control={form.control} name="ruralBlock" render={({ field }) => ( <FormItem><FormLabel>Block*</FormLabel><Select onValueChange={(val) => { field.onChange(val); form.setValue('ruralPanchayat', ''); }} value={field.value ?? ""} disabled={!watchedRuralDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{ruralBlocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                             <FormField control={form.control} name="ruralPanchayat" render={({ field }) => ( <FormItem><FormLabel>Panchayat*</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedRuralBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{ruralPanchayats.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                             <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input value={lgdCode} readOnly className="bg-muted" /></FormControl></FormItem>
                                                        </div>
                                                    )}
                                                     {watchedLocationType === 'urban' && (
                                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <FormField control={form.control} name="urbanDistrict" render={({ field }) => ( <FormItem><FormLabel>District*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                            <FormField control={form.control} name="urbanBodyType" render={({ field }) => ( <FormItem><FormLabel>Urban Body Type*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Body Type" /></SelectTrigger></FormControl><SelectContent>{ULB_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                            <FormField control={form.control} name="urbanBodyName" render={({ field }) => ( <FormItem><FormLabel>Urban Body Name*</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedUrbanType}><FormControl><SelectTrigger><SelectValue placeholder="Select Body Name" /></SelectTrigger></FormControl><SelectContent>{urbanBodies.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                         </div>
                                                     )}
                                                     <FormField control={form.control} name="fullAddress" render={({ field }) => ( <FormItem><FormLabel>Full Address (as per Aadhaar)*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pincode*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                             </Card>
                                        </TabsContent>

                                        <TabsContent value="family-details" className="pt-6">
                                            <Card>
                                                <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                     <FormField control={form.control} name="fatherName" render={({ field }) => ( <FormItem><FormLabel>Father's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="motherName" render={({ field }) => ( <FormItem><FormLabel>Mother's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="spouseName" render={({ field }) => ( <FormItem><FormLabel>Spouse Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="personal-details" className="pt-6">
                                             <Card>
                                                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                                         <FormField control={form.control} name="religion" render={({ field }) => ( <FormItem><FormLabel>Religion*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Hindu">Hindu</SelectItem><SelectItem value="Muslim">Muslim</SelectItem><SelectItem value="Christian">Christian</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                         <FormField control={form.control} name="caste" render={({ field }) => ( <FormItem><FormLabel>Caste*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                         <FormField control={form.control} name="dob" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                         <FormItem><FormLabel>Age</FormLabel><FormControl><Input value={calculateAge(form.watch('dob'))} readOnly className="bg-muted" /></FormControl></FormItem>
                                                         <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Male" /></FormControl><FormLabel>Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Female" /></FormControl><FormLabel>Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel>Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                                                         {watchedGender === 'Female' && <FormField control={form.control} name="femaleType" render={({ field }) => ( <FormItem><FormLabel>Female Type*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="single_women">Single Women</SelectItem><SelectItem value="widow">Widow</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />}
                                                    </div>
                                                    <Card>
                                                        <CardHeader><CardTitle className="text-base">Health Related</CardTitle></CardHeader>
                                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                            <FormField control={form.control} name="differentlyAbled" render={({ field }) => ( <FormItem><FormLabel>Differently Abled?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                                                            {watchedDifferentlyAbled === 'yes' && <FormField control={form.control} name="disabilityCertificate" render={({ field }) => (<FormItem><FormLabel>Upload Certificate* (Max 5MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />}
                                                            <FormField control={form.control} name="healthIssues" render={({ field }) => ( <FormItem><FormLabel>Health Issues*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Health Status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="minor">Minor</SelectItem><SelectItem value="major">Major</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                            {['minor', 'major'].includes(watchedHealthIssues || '') && <FormField control={form.control} name="issueDetails" render={({ field }) => (<FormItem><FormLabel>Type of Issues*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
                                                            {watchedHealthIssues === 'major' && <FormField control={form.control} name="medicalCertificate" render={({ field }) => (<FormItem><FormLabel>Medical Certificate* (Max 20MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />}
                                                        </CardContent>
                                                    </Card>
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                             </Card>
                                        </TabsContent>
                                        
                                         <TabsContent value="personal-info" className="pt-6">
                                             <Card>
                                                <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
                                                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                     <FormField control={form.control} name="contactNumber2" render={({ field }) => ( <FormItem><FormLabel>Contact Number 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="personalEmail" render={({ field }) => ( <FormItem><FormLabel>Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="eportalEmail" render={({ field }) => ( <FormItem><FormLabel>E-Portal Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="bankName" render={({ field }) => ( <FormItem><FormLabel>Bank Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="branchName" render={({ field }) => ( <FormItem><FormLabel>Branch Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="accountNumber" render={({ field }) => ( <FormItem><FormLabel>Account Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="ifscCode" render={({ field }) => ( <FormItem><FormLabel>IFSC Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="aadhaar" render={({ field }) => ( <FormItem><FormLabel>Aadhaar*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="aadhaarUpload" render={({ field }) => ( <FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)}/></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="pan" render={({ field }) => ( <FormItem><FormLabel>PAN*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="panUpload" render={({ field }) => ( <FormItem><FormLabel>PAN Upload*</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files)}/></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="uan" render={({ field }) => ( <FormItem><FormLabel>UAN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                     <FormField control={form.control} name="pfmsId" render={({ field }) => ( <FormItem><FormLabel>PFMS ID*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                             </Card>
                                        </TabsContent>

                                         <TabsContent value="education-experience" className="pt-6">
                                            <div className="space-y-6">
                                                <Card>
                                                   <CardHeader><CardTitle>Academic Details*</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <DynamicTable name="academics" control={form.control} appendValues={{ course: '', institution: '', board: '', fromYear: '', toYear: '', aggregate: 0, certificate: null }}
                                                            columns={[
                                                                { header: 'Course', render: (i) => <FormField control={form.control} name={`academics.${i}.course`} render={({field}) => <Input {...field} />} /> },
                                                                { header: 'Institution', render: (i) => <FormField control={form.control} name={`academics.${i}.institution`} render={({field}) => <Input {...field} />} /> },
                                                                { header: 'Board / University', render: (i) => <FormField control={form.control} name={`academics.${i}.board`} render={({field}) => <Input {...field} />} /> },
                                                                { header: 'From Year', render: (i) => <FormField control={form.control} name={`academics.${i}.fromYear`} render={({field}) => <Input type="number" {...field} />} /> },
                                                                { header: 'To Year', render: (i) => <FormField control={form.control} name={`academics.${i}.toYear`} render={({field}) => <Input type="number" {...field} />} /> },
                                                                { header: 'Aggregate %', render: (i) => <FormField control={form.control} name={`academics.${i}.aggregate`} render={({field}) => <Input type="number" {...field} />} /> },
                                                                { header: 'Upload Certificate', render: (i) => <FormField control={form.control} name={`academics.${i}.certificate`} render={({field}) => <Input type="file" onChange={(e) => field.onChange(e.target.files)} />} /> },
                                                            ]}
                                                        />
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                   <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <DynamicTable name="workExperiences" control={form.control} appendValues={{ name: '', natureOfJob: '', from: undefined, to: undefined, certificate: null }}
                                                            columns={[
                                                                { header: 'Name', render: (i) => <FormField control={form.control} name={`workExperiences.${i}.name`} render={({field}) => <Input {...field} />} /> },
                                                                { header: 'Nature of Job', render: (i) => <FormField control={form.control} name={`workExperiences.${i}.natureOfJob`} render={({field}) => <Input {...field} />} /> },
                                                                { header: 'From', render: (i) => <FormField control={form.control} name={`workExperiences.${i}.from`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                { header: 'To', render: (i) => <FormField control={form.control} name={`workExperiences.${i}.to`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                { header: 'Duration', render: (i) => <Input readOnly className="bg-muted" value={calculateDuration(form.watch(`workExperiences.${i}.from`), form.watch(`workExperiences.${i}.to`))} /> },
                                                                { header: 'Upload Certificate', render: (i) => <FormField control={form.control} name={`workExperiences.${i}.certificate`} render={({field}) => <Input type="file" onChange={(e) => field.onChange(e.target.files)} />} /> },
                                                            ]}
                                                        />
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                   <CardHeader><CardTitle>Skills*</CardTitle></CardHeader>
                                                    <CardContent>
                                                         <DynamicTable name="skills" control={form.control} appendValues={{ skill: '' }}
                                                            columns={[
                                                                { header: 'Skill', render: (i) => <FormField control={form.control} name={`skills.${i}.skill`} render={({field}) => <Textarea {...field} />} />, className: "w-[80%]" },
                                                            ]}
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                             <div className="p-6 pt-0 text-right"><Button>Save</Button></div>
                                        </TabsContent>
                                        
                                        {showConditionalTabs && <TabsContent value="working-details" className="pt-6">
                                            <Card>
                                                <CardHeader><CardTitle>Working Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                     <FormField control={form.control} name="joiningDate" render={({ field }) => (<FormItem className="flex flex-col max-w-sm"><FormLabel>Joining Date*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                     {selectedRole === 'BRP' && (
                                                         <Card>
                                                             <CardHeader><CardTitle>BRP - Worked/Present Station Details*</CardTitle></CardHeader>
                                                             <CardContent>
                                                                 <DynamicTable name="brpWorkedStations" control={form.control} appendValues={{ district: '', block: '', fromDate: undefined, toDate: undefined }}
                                                                    columns={[
                                                                        { header: 'District', render: i => <FormField control={form.control} name={`brpWorkedStations.${i}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{DISTRICTS.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>} /> },
                                                                        { header: 'Block', render: i => <FormField control={form.control} name={`brpWorkedStations.${i}.block`} render={({field}) => <Input {...field}/>} /> },
                                                                        { header: 'From', render: (i) => <FormField control={form.control} name={`brpWorkedStations.${i}.fromDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'To', render: (i) => <FormField control={form.control} name={`brpWorkedStations.${i}.toDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'Duration', render: (i) => <Input readOnly className="bg-muted" value={calculateDuration(form.watch(`brpWorkedStations.${i}.fromDate`), form.watch(`brpWorkedStations.${i}.toDate`))} /> },
                                                                    ]}
                                                                />
                                                             </CardContent>
                                                         </Card>
                                                     )}
                                                     {selectedRole === 'DRP' && (
                                                          <Card>
                                                             <CardHeader><CardTitle>DRP - Worked/Present Station Details*</CardTitle></CardHeader>
                                                             <CardContent>
                                                                  <DynamicTable name="drpWorkedStations" control={form.control} appendValues={{ district: '', fromDate: undefined, toDate: undefined }}
                                                                    columns={[
                                                                        { header: 'District', render: i => <FormField control={form.control} name={`drpWorkedStations.${i}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{DISTRICTS.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>} /> },
                                                                        { header: 'From', render: (i) => <FormField control={form.control} name={`drpWorkedStations.${i}.fromDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'To', render: (i) => <FormField control={form.control} name={`drpWorkedStations.${i}.toDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'Duration', render: (i) => <Input readOnly className="bg-muted" value={calculateDuration(form.watch(`drpWorkedStations.${i}.fromDate`), form.watch(`drpWorkedStations.${i}.toDate`))} /> },
                                                                    ]}
                                                                />
                                                             </CardContent>
                                                         </Card>
                                                     )}
                                                     <FormField control={form.control} name="isDrpIC" render={({field}) => (
                                                        <FormItem className="flex items-center gap-4"><FormLabel>Have you worked as DRP I/C?</FormLabel>
                                                        <FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage/></FormItem>
                                                     )} />
                                                      {watchedIsDrpIc === 'yes' && (
                                                          <Card>
                                                             <CardHeader><CardTitle>DRP I/C - Worked/Present Station Details*</CardTitle></CardHeader>
                                                             <CardContent>
                                                                  <DynamicTable name="drpICWorkedStations" control={form.control} appendValues={{ district: '', fromDate: undefined, toDate: undefined }}
                                                                    columns={[
                                                                        { header: 'District', render: i => <FormField control={form.control} name={`drpICWorkedStations.${i}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{DISTRICTS.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>} /> },
                                                                        { header: 'From', render: (i) => <FormField control={form.control} name={`drpICWorkedStations.${i}.fromDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'To', render: (i) => <FormField control={form.control} name={`drpICWorkedStations.${i}.toDate`} render={({field}) => <Input type="date" value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(new Date(e.target.value))}/>} /> },
                                                                        { header: 'Duration', render: (i) => <Input readOnly className="bg-muted" value={calculateDuration(form.watch(`drpICWorkedStations.${i}.toDate`), form.watch(`drpICWorkedStations.${i}.fromDate`))} /> },
                                                                    ]}
                                                                />
                                                             </CardContent>
                                                         </Card>
                                                     )}
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                            </Card>
                                        </TabsContent>}

                                        {showConditionalTabs && <TabsContent value="training-audit" className="pt-6">
                                            <Card>
                                                <CardHeader><CardTitle>Training & Audit Particulars</CardTitle></CardHeader>
                                                <CardContent>
                                                    <div className="p-4 border rounded-md space-y-4">
                                                       <h3 className="text-lg font-semibold text-primary">Training & Audit Particulars</h3>
                                                       <Tabs defaultValue="training-taken">
                                                           <TabsList>
                                                               <TabsTrigger value="training-taken">Training Taken</TabsTrigger>
                                                               <TabsTrigger value="training-given">Training Given</TabsTrigger>
                                                               <TabsTrigger value="pilot-audit">Pilot Audit</TabsTrigger>
                                                               <TabsTrigger value="state-office">State Office Activities</TabsTrigger>
                                                           </TabsList>
                                                            <TabsContent value="training-taken" className="pt-4">
                                                                 <FormField control={form.control} name="trainingTaken" render={({field}) => (<FormItem className="flex items-center gap-4"><FormLabel>Training Taken?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage/></FormItem>)} />
                                                            </TabsContent>
                                                             <TabsContent value="training-given" className="pt-4">
                                                                 <FormField control={form.control} name="trainingGiven" render={({field}) => (<FormItem className="flex items-center gap-4"><FormLabel>Training Given?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage/></FormItem>)} />
                                                            </TabsContent>
                                                             <TabsContent value="pilot-audit" className="pt-4">
                                                                 <FormField control={form.control} name="pilotAudit" render={({field}) => (<FormItem className="flex items-center gap-4"><FormLabel>Pilot Audit?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage/></FormItem>)} />
                                                            </TabsContent>
                                                            <TabsContent value="state-office" className="pt-4">
                                                                <FormField control={form.control} name="stateOfficeActivities" render={({field}) => (<FormItem className="flex items-center gap-4"><FormLabel>State Office Activities?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage/></FormItem>)} />
                                                            </TabsContent>
                                                       </Tabs>
                                                    </div>
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                            </Card>
                                        </TabsContent>}

                                        <TabsContent value="disclaimer" className="pt-6">
                                             <Card>
                                                <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
                                                <CardContent>
                                                    <FormField control={form.control} name="disclaimer" render={({ field }) => (
                                                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel>I hereby declare that the information provided is true and correct to the best of my knowledge.</FormLabel>
                                                                <FormMessage />
                                                            </div>
                                                        </FormItem>
                                                    )} />
                                                </CardContent>
                                                <div className="p-6 pt-0"><Button>Save</Button></div>
                                             </Card>
                                        </TabsContent>
                                    </Tabs>
                                )}

                                <div className="flex justify-end gap-4 pt-8">
                                  <Dialog open={!!previewData} onOpenChange={(isOpen) => !isOpen && setPreviewData(null)}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" disabled={!selectedRole} onClick={() => setPreviewData(form.getValues())}>Preview All Details</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Preview Registration Details</DialogTitle>
                                            <DialogDescription>Please review all details carefully before final submission.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            {previewData && <pre className="whitespace-pre-wrap p-4 bg-muted rounded-md text-xs">{JSON.stringify(previewData, (key, value) => key === 'photo' ? '[File]' : value , 2)}</pre>}
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                                            <Button onClick={handleFinalSubmit}>Final Submit</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                   <Button type="submit" disabled={!selectedRole}>Final Submit</Button>
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
