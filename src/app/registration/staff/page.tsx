
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, Upload, User as UserIcon } from "lucide-react";

import { cn, toTitleCase } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useToast } from "@/hooks/use-toast";

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const uniqueDistricts = Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort();
const religions = ["Hindu", "Muslim", "Christian", "Other"];
const castes = ["SC", "ST", "OBC", "General"];
const qualifications = ["Xth", "XIIth", "UG", "PG", "Other"];

const academicSchema = z.object({
  course: z.string().min(1, "Course is required"),
  institution: z.string().min(1, "Institution is required"),
  board: z.string().min(1, "Board/University is required"),
  year: z.string().regex(/^\d{4}$/, "Invalid year"),
  aggregate: z.coerce.number().min(0).max(100),
  certificate: z.any().optional(),
});

const workExperienceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nature: z.string().min(1, "Nature of job is required"),
  from: z.date({ required_error: "From date is required" }),
  to: z.date({ required_error: "To date is required" }),
  certificate: z.any().optional(),
});

const staffRegistrationSchema = z.object({
  designation: z.enum(ROLES, { required_error: "Designation is required" }),
  recruitmentType: z.enum(["direct", "retired"], { required_error: "Recruitment type is required" }),
  employeeCode: z.string().min(1, "Please select an employee"),
  name: z.string(),
  locationType: z.enum(["rural", "urban"], { required_error: "Location type is required" }),
  district: z.string().min(1, "District is required"),
  block: z.string().optional(),
  panchayat: z.string().optional(),
  urbanBodyType: z.enum(["town_panchayat", "municipality", "corporation"]).optional(),
  urbanBodyName: z.string().optional(),
  address: z.string().min(1, "Full address is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  spouseName: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  dob: z.date({ required_error: "Date of Birth is required" }),
  gender: z.enum(["Male", "Female", "Other"]),
  femaleType: z.string().optional(),
  contactNumber1: z.string().regex(/^\d{10}$/, "Must be a 10-digit number"),
  contactNumber2: z.string().optional(),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  accountNumber: z.string().regex(/^\d+$/, "Account number must contain only digits"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal('')),
  uan: z.string().optional(),
  pfmsId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  eportalEmail: z.string().email("Invalid email address"),
  isDifferentlyAbled: z.enum(["yes", "no"]),
  healthIssues: z.enum(["normal", "minor", "major"]),
  healthIssueType: z.string().optional(),
  medicalCertificate: z.any().optional(),
  academicDetails: z.array(academicSchema),
  workExperience: z.array(workExperienceSchema),
  skills: z.string().optional(),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  hasWorkedAsDrpIc: z.enum(["yes", "no"]),
  disclaimer: z.boolean().refine(val => val === true, { message: "You must accept the disclaimer" }),
  
  photo: z.any().optional(),
  aadhaarCopy: z.any().optional(),
  panCopy: z.any().optional(),

}).refine(data => data.locationType === 'urban' || (data.block && data.panchayat), {
  message: "Block and Panchayat are required for rural locations", path: ["panchayat"],
}).refine(data => data.locationType === 'rural' || (data.urbanBodyType && data.urbanBodyName), {
  message: "Urban body type and name are required for urban locations", path: ["urbanBodyName"],
});

type FormValues = z.infer<typeof staffRegistrationSchema>;

const DynamicTable = ({ control, name, columns, appendValues }: any) => {
    const { fields, append, remove } = useFieldArray({ control, name });
    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col: any) => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            {columns.map((col: any) => (
                                <TableCell key={col.accessor}>
                                    <FormField
                                        control={control}
                                        name={`${name}.${index}.${col.accessor}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                {col.type === 'date' ? (
                                                     <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                                    </Popover>
                                                ) : col.type === 'number' ? (
                                                    <Input type="number" {...field} />
                                                ) : (
                                                    <Input {...field} />
                                                )}
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                            ))}
                            <TableCell><Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2/></Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button type="button" size="sm" onClick={() => append(appendValues)}><PlusCircle className="mr-2"/>Add Row</Button>
        </div>
    );
}


export default function StaffRegistrationPage() {
    const { user, loading } = useAuth();
    const { users, addUser } = useUsers(); // Assuming addUser can be used to update/add staff data
    const { toast } = useToast();
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [previewData, setPreviewData] = useState<FormValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(staffRegistrationSchema),
        defaultValues: { academicDetails: [], workExperience: [] }
    });

    const locationType = form.watch("locationType");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const isFemale = form.watch("gender") === 'Female';
    const isDifferentlyAbled = form.watch("isDifferentlyAbled");
    const healthIssues = form.watch("healthIssues");

    const availableUsers = useMemo(() => users.filter(u => u.designation !== 'VRP'), [users]);
    const blocksForDistrict = useMemo(() => watchedDistrict ? [...new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))].sort() : [], [watchedDistrict]);
    const panchayatsForBlock = useMemo(() => watchedBlock ? MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a,b) => a.name.localeCompare(b.name)) : [], [watchedBlock]);
    const lgdCode = useMemo(() => MOCK_PANCHAYATS.find(p => p.lgdCode === form.watch('panchayat'))?.lgdCode || '', [form.watch('panchayat')]);

    const handleEmployeeSelect = (employeeCode: string) => {
        const user = availableUsers.find(u => u.employeeCode === employeeCode);
        if(user) {
            setSelectedUser(user);
            form.setValue("name", user.name);
            form.setValue("designation", user.designation);
            form.setValue("dob", new Date(user.dateOfBirth));
            form.setValue("contactNumber1", user.mobileNumber);
            form.setValue("email", user.email || '');
        }
    };
    
    const age = useMemo(() => {
        const dob = form.watch('dob');
        if (!dob) return '';
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age.toString();
    }, [form.watch('dob')]);

    const onSubmit = (data: FormValues) => {
        console.log(data);
        setIsSubmitting(true);
        // In a real app, here you would handle file uploads and then save data to a database.
        toast({
            title: "Registration Submitted!",
            description: "The staff details have been recorded.",
        });
        form.reset();
        setSelectedUser(null);
        setPreviewData(null);
        setIsSubmitting(false);
    };

    if (loading) return <p>Loading...</p>

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header /><MainNavigation />
                 <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                    <p className="mt-4">You must be signed in to view this page.</p>
                </main>
                <Footer />
            </div>
        )
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
                    <CardTitle>Staff Registration Form</CardTitle>
                    <CardDescription>Enter the details of the new or existing staff member.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={selectedUser?.profilePicture || undefined} />
                                    <AvatarFallback><UserIcon className="h-12 w-12" /></AvatarFallback>
                                </Avatar>
                                <FormField control={form.control} name="photo" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files)} className="text-xs" /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="space-y-4 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField control={form.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Role/Designation</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger></FormControl><SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="recruitmentType" render={({ field }) => (<FormItem><FormLabel>Recruitment Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="direct">Direct</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="employeeCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee Code</FormLabel>
                                        <Select onValueChange={(val) => {field.onChange(val); handleEmployeeSelect(val);}} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Employee"/></SelectTrigger></FormControl>
                                            <SelectContent>{availableUsers.map(u => <SelectItem key={u.id} value={u.employeeCode}>{u.employeeCode} - {u.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage/></FormItem>)} />
                            </div>
                        </div>
                    </div>

                    {/* Personal & Location */}
                     <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Personal & Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <FormField control={form.control} name="locationType" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent><SelectItem value="rural">Rural</SelectItem><SelectItem value="urban">Urban</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                            
                            {locationType === 'rural' && <>
                                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District"/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                                <FormField control={form.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block"/></SelectTrigger></FormControl><SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{toTitleCase(b)}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                                <FormField control={form.control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat"/></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{toTitleCase(p.name)}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                                <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input value={lgdCode} readOnly className="bg-muted" /></FormControl></FormItem>
                            </>}

                             {locationType === 'urban' && <>
                                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District"/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                                <FormField control={form.control} name="urbanBodyType" render={({ field }) => (<FormItem><FormLabel>Urban Body Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent><SelectItem value="town_panchayat">Town Panchayat</SelectItem><SelectItem value="municipality">Municipality</SelectItem><SelectItem value="corporation">Corporation</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                                <FormField control={form.control} name="urbanBodyName" render={({ field }) => (<FormItem><FormLabel>Urban Body Name</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>)} />
                            </>}
                            
                            <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="lg:col-span-2"><FormLabel>Full Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Family Details */}
                         <div className="p-4 border rounded-md space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Family Details</h3>
                            <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="motherName" render={({ field }) => (<FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="spouseName" render={({ field }) => (<FormItem><FormLabel>Spouse Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                        </div>
                        {/* Personal Info */}
                        <div className="p-4 border rounded-md space-y-4">
                             <h3 className="text-lg font-semibold text-primary">Personal Info</h3>
                             <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Religion"/></SelectTrigger></FormControl><SelectContent>{religions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                             <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Caste</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Caste"/></SelectTrigger></FormControl><SelectContent>{castes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>)} />
                             <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="dob" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                                        <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormItem><FormLabel>Age</FormLabel><FormControl><Input value={age} readOnly className="bg-muted"/></FormControl></FormItem>
                             </div>
                              <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem className="space-y-3"><FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Male"/></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Female"/></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Other"/></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                                    </RadioGroup></FormControl><FormMessage/></FormItem>
                                )}/>
                                {isFemale && (
                                     <FormField control={form.control} name="femaleType" render={({ field }) => (<FormItem><FormLabel>Female Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger></FormControl><SelectContent><SelectItem value="single">Single Women</SelectItem><SelectItem value="widow">Widow</SelectItem></SelectContent></Select><FormMessage/></FormItem>)} />
                                )}
                        </div>
                    </div>
                    {/* Contact, Bank, ID */}
                     <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Contact, Bank & ID Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField control={form.control} name="contactNumber1" render={({ field }) => (<FormItem><FormLabel>Contact Number 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="contactNumber2" render={({ field }) => (<FormItem><FormLabel>Contact Number 2 (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email ID</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="eportalEmail" render={({ field }) => (<FormItem><FormLabel>E-Portal Email ID</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="branchName" render={({ field }) => (<FormItem><FormLabel>Branch Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="ifscCode" render={({ field }) => (<FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="aadhaar" render={({ field }) => (<FormItem><FormLabel>Aadhaar</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="aadhaarCopy" render={({ field }) => (<FormItem><FormLabel>Aadhaar Upload</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="pan" render={({ field }) => (<FormItem><FormLabel>PAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                             <FormField control={form.control} name="panCopy" render={({ field }) => (<FormItem><FormLabel>PAN Upload</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="uan" render={({ field }) => (<FormItem><FormLabel>UAN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                            <FormField control={form.control} name="pfmsId" render={({ field }) => (<FormItem><FormLabel>PFMS ID (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                        </div>
                     </div>
                     {/* Health */}
                     <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Health Related</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                             <FormField control={form.control} name="isDifferentlyAbled" render={({ field }) => ( <FormItem><FormLabel>Differently Abled?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                             <FormField control={form.control} name="healthIssues" render={({ field }) => ( <FormItem><FormLabel>Health Issues</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="normal" /></FormControl><FormLabel className="font-normal">Normal</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="minor" /></FormControl><FormLabel className="font-normal">Minor</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="major" /></FormControl><FormLabel className="font-normal">Major</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)}/>
                             {(healthIssues === 'minor' || healthIssues === 'major') && <FormField control={form.control} name="healthIssueType" render={({ field }) => (<FormItem><FormLabel>Type of Issues</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>}
                             {healthIssues === 'major' && <FormField control={form.control} name="medicalCertificate" render={({ field }) => (<FormItem><FormLabel>Medical Certificate (Max 20MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage/></FormItem>)}/>}
                        </div>
                     </div>
                     {/* Education */}
                     <div className="p-4 border rounded-md space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Education & Working Details</h3>
                         <div>
                            <h4 className="font-semibold mb-2">Academic Details</h4>
                            <DynamicTable name="academicDetails" control={form.control} appendValues={{ course: '', institution: '', board: '', year: '', aggregate: '' }} columns={[ {header: 'Course', accessor: 'course'}, {header: 'Institution', accessor: 'institution'}, {header: 'Board/University', accessor: 'board'}, {header: 'Year', accessor: 'year'}, {header: 'Aggregate %', accessor: 'aggregate', type:'number'}, ]} />
                         </div>
                         <Separator/>
                         <div>
                            <h4 className="font-semibold mb-2">Work Experience</h4>
                             <DynamicTable name="workExperience" control={form.control} appendValues={{ name: '', nature: '', from: '', to: '' }} columns={[ {header: 'Name', accessor: 'name'}, {header: 'Nature of Job', accessor: 'nature'}, {header: 'From Date', accessor: 'from', type:'date'}, {header: 'To Date', accessor: 'to', type: 'date'}, ]} />
                         </div>
                     </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => { setPreviewData(form.getValues()) }}>Preview All Details</Button>
                        <Button type="submit" disabled={isSubmitting}>Submit</Button>
                    </div>
                </CardContent>
            </Card>
            </form>
        </Form>
        
        <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registration Preview</DialogTitle>
                    <DialogDescription>Please review all details before final submission.</DialogDescription>
                </DialogHeader>
                {previewData && (
                     <div className="space-y-4 text-sm">
                        <p><strong>Employee Code:</strong> {previewData.employeeCode}</p>
                        <p><strong>Name:</strong> {previewData.name}</p>
                        <p><strong>Designation:</strong> {previewData.designation}</p>
                        {/* Add all other fields here... */}
                     </div>
                )}
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setPreviewData(null)}>Edit</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
