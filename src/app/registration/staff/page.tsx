
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, Upload, Eye } from "lucide-react";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const fileSchema = z.any()
  .refine(files => files?.length == 1, 'File is required.').optional().nullable()
  .refine(files => !files || files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`).optional().nullable();

const medicalFileSchema = z.any()
  .refine(files => files?.length == 1, 'File is required.').optional().nullable()
  .refine(files => !files || files?.[0]?.size <= 20 * 1024 * 1024, `Max file size is 20MB.`).optional().nullable();

const academicDetailSchema = z.object({
  course: z.string().min(1),
  institution: z.string().min(1),
  board: z.string().min(1),
  fromYear: z.string().min(4),
  toYear: z.string().min(4),
  aggregate: z.coerce.number().min(0).max(100),
  certificate: fileSchema,
});

const workExperienceSchema = z.object({
  name: z.string().min(1),
  natureOfJob: z.string().min(1),
  from: z.date(),
  to: z.date(),
  certificate: fileSchema,
});

const skillSchema = z.object({
  skill: z.string().min(1),
});

const trainingSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1),
  trainingName: z.string().min(1),
  grade: z.string().optional(),
});

const auditSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1),
  schemeName: z.string().min(1),
});

const stateOfficeActivitySchema = z.object({
  year: z.string().min(4),
  workParticulars: z.string().min(1),
});

const workedStationSchema = z.object({
    district: z.string().min(1),
    block: z.string().optional(),
    fromDate: z.date(),
    toDate: z.date(),
})

const staffFormSchema = z.object({
    // Basic Info
    photo: z.any().refine(files => files?.length == 1, 'Photo is required.'),
    recruitmentType: z.enum(['direct', 'retired'], {required_error: "Recruitment type is required"}),
    employeeCode: z.string().min(1, "Please select an employee code"),
    name: z.string(),
    email: z.string(),
    contactNumber1: z.string(),

    // Location Details
    locationType: z.enum(['rural', 'urban'], {required_error: "Location type is required"}),
    ruralDistrict: z.string().optional(),
    ruralBlock: z.string().optional(),
    ruralPanchayat: z.string().optional(),
    urbanDistrict: z.string().optional(),
    urbanBodyType: z.enum(ULB_TYPES).optional(),
    urbanBodyName: z.string().optional(),
    fullAddress: z.string().min(1, "Address is required"),
    pincode: z.string().regex(/^\d{6}$/, "Must be 6 digits"),

    // Family Details
    fatherName: z.string().min(1),
    motherName: z.string().min(1),
    spouseName: z.string().optional(),
    
    // Personal Details
    religion: z.enum(['Hindu', 'Muslim', 'Christian', 'Other'], {required_error: "Religion is required"}),
    caste: z.string().min(1),
    casteCertificate: fileSchema,
    dob: z.date({required_error: "Date of birth is required"}),
    dobCertificate: fileSchema,
    gender: z.enum(['Male', 'Female', 'Other'], {required_error: "Gender is required"}),
    femaleType: z.enum(['single_women', 'widow']).optional(),
    differentlyAbled: z.enum(['yes', 'no'], {required_error: "This field is required"}),
    disabilityCertificate: fileSchema.optional(),
    healthIssues: z.enum(['normal', 'minor', 'major'], {required_error: "Health status is required"}),
    issueDetails: z.string().optional(),
    medicalCertificate: medicalFileSchema.optional(),
    
    // Personal Info (Contact/Financial)
    contactNumber2: z.string().optional(),
    personalEmail: z.string().email(),
    eportalEmail: z.string().email(),
    bankName: z.string().min(1),
    branchName: z.string().min(1),
    accountNumber: z.string().regex(/^\d+$/, "Account number must be digits only"),
    ifscCode: z.string().min(1),
    aadhaar: z.string().regex(/^\d{12}$/, "Must be 12 digits"),
    aadhaarUpload: z.any().refine(files => files?.length == 1, 'Aadhaar copy is required.'),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
    panUpload: z.any().refine(files => files?.length == 1, 'PAN copy is required.'),
    uan: z.string().optional(),
    pfmsId: z.string().min(1),
    
    // Education & Experience
    academics: z.array(academicDetailSchema).min(1, "At least one academic detail is required"),
    workExperiences: z.array(workExperienceSchema),
    skills: z.array(skillSchema).min(1, "At least one skill is required"),

    // Working Details (Conditional)
    joiningDate: z.date().optional(),
    brpWorkedStations: z.array(workedStationSchema).optional(),
    drpWorkedStations: z.array(workedStationSchema).optional(),
    isDrpIC: z.enum(['yes', 'no']).optional(),
    drpICWorkedStations: z.array(workedStationSchema).optional(),

    // Training & Audit (Conditional)
    trainingTaken: z.enum(['yes', 'no']).optional(),
    trainingsTakenDetails: z.array(trainingSchema).optional(),
    trainingGiven: z.enum(['yes', 'no']).optional(),
    trainingsGivenDetails: z.array(trainingSchema).optional(),
    pilotAudit: z.enum(['yes', 'no']).optional(),
    pilotAuditDetails: z.array(auditSchema).optional(),
    stateOfficeActivities: z.enum(['yes', 'no']).optional(),
    stateOfficeActivityDetails: z.array(stateOfficeActivitySchema).optional(),

    // Disclaimer
    disclaimer: z.boolean().refine(val => val === true, "You must accept the disclaimer"),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function StaffRegistrationPage() {
    const { toast } = useToast();
    const { user: loggedInUser, loading: authLoading } = useAuth();
    const { users, loading: usersLoading } = useUsers();
    
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [previewData, setPreviewData] = useState<StaffFormValues | null>(null);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: { academics: [], workExperiences: [], skills: [], disclaimer: false },
    });
    
    const watchedEmployeeCode = useWatch({ control: form.control, name: 'employeeCode' });
    const watchedLocationType = useWatch({ control: form.control, name: 'locationType' });
    const watchedRuralDistrict = useWatch({ control: form.control, name: 'ruralDistrict' });
    const watchedRuralBlock = useWatch({ control: form.control, name: 'ruralBlock' });
    const watchedUrbanDistrict = useWatch({ control: form.control, name: 'urbanDistrict' });
    const watchedUrbanType = useWatch({ control: form.control, name: 'urbanBodyType' });
    const watchedDifferentlyAbled = useWatch({ control: form.control, name: 'differentlyAbled' });
    const watchedHealthIssues = useWatch({ control: form.control, name: 'healthIssues' });
    const watchedIsDrpIc = useWatch({ control: form.control, name: 'isDrpIC' });

    const eligibleUsers = useMemo(() => {
        if (!selectedRole) return [];
        return users.filter(u => u.designation === selectedRole);
    }, [selectedRole, users]);

    useEffect(() => {
        if (watchedEmployeeCode) {
            const selectedUser = users.find(u => u.employeeCode === watchedEmployeeCode);
            if (selectedUser) {
                form.setValue('name', selectedUser.name);
                form.setValue('email', selectedUser.email || '');
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
                                                {ROLES.filter(r => r !== 'VRP').map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                </div>
                                {selectedRole && (
                                    <Tabs defaultValue="basic-info" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                                            <TabsTrigger value="personal-details">Personal Details</TabsTrigger>
                                            <TabsTrigger value="education-experience">Education & Experience</TabsTrigger>
                                            {showConditionalTabs && <TabsTrigger value="working-details">Working Details</TabsTrigger>}
                                            {showConditionalTabs && <TabsTrigger value="training-audit">Training & Audit</TabsTrigger>}
                                            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
                                        </TabsList>
                                        
                                        {/* All other tabs content will go here */}

                                    </Tabs>
                                )}

                                <div className="flex justify-end gap-4 pt-8">
                                  <Dialog open={!!previewData} onOpenChange={(isOpen) => !isOpen && setPreviewData(null)}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" onClick={() => form.handleSubmit(onSubmit)()}>Preview All Details</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader><DialogTitle>Preview Details</DialogTitle></DialogHeader>
                                        <div className="space-y-4">
                                            {previewData && <pre className="whitespace-pre-wrap">{JSON.stringify(previewData, null, 2)}</pre>}
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                                            <Button onClick={handleFinalSubmit}>Final Submit</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button type="submit">Save (to Preview)</Button>
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
