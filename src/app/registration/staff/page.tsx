
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, differenceInYears } from 'date-fns';
import { CalendarIcon, Upload, ChevronsUpDown, Check, X } from 'lucide-react';

import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User as StaffUser } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { MOCK_ULBS, UrbanLocalBody, ULB_TYPES } from '@/services/ulb';
import { uniqueDistricts } from '@/lib/utils';


import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';


const staffFormSchema = z.object({
  designation: z.string().min(1, "Role/Designation is required."),
  
  // Basic Information
  photo: z.any().optional(),
  recruitmentType: z.enum(['direct', 'retired'], { required_error: "Recruitment Type is required."}),
  employeeCode: z.string().min(1, "Employee Code is required."),
  name: z.string(),
  contactNumber: z.string(),

  // Location Details
  locationType: z.enum(['rural', 'urban'], { required_error: "Location Type is required."}),
  district: z.string().min(1, "District is required."),
  block: z.string().optional(),
  panchayat: z.string().optional(),
  lgdCode: z.string().optional(),
  urbanBodyType: z.enum(ULB_TYPES).optional(),
  urbanBodyName: z.string().optional(),
  fullAddress: z.string().min(1, "Full Address is required."),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),

  // Family Details
  fatherName: z.string().min(1, "Father's Name is required."),
  motherName: z.string().min(1, "Mother's Name is required."),
  spouseName: z.string().optional(),

  // Personal details
  religion: z.string().min(1, "Religion is required."),
  caste: z.string().min(1, "Caste is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  age: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  femaleType: z.string().optional(),
  isDifferentlyAbled: z.enum(['yes', 'no'], { required_error: "This field is required."}),
  differentlyAbledCert: z.any().optional(),
  healthIssues: z.enum(['normal', 'minor', 'major'], { required_error: "This field is required."}),
  healthIssuesDetails: z.string().optional(),
  medicalCert: z.any().optional(),

  // Personal Info
  contactNumber2: z.string().optional(),
  emailId: z.string().email("Invalid email address."),
  eportalEmailId: z.string().email("Invalid E-Portal email address."),
  pfmsId: z.string().min(1, "PFMS ID is required."),
  bankName: z.string().min(1, "Bank Name is required."),
  branchName: z.string().min(1, "Branch Name is required."),
  accountNumber: z.string().min(1, "Account Number is required."),
  ifscCode: z.string().min(1, "IFSC Code is required."),
  aadhaar: z.string().min(12, "Aadhaar must be 12 digits.").max(12, "Aadhaar must be 12 digits."),
  aadhaarUpload: z.any().refine(file => file?.[0], "Aadhaar copy is required."),
  pan: z.string().min(10, "PAN must be 10 characters.").max(10, "PAN must be 10 characters."),
  panUpload: z.any().refine(file => file?.[0], "PAN copy is required."),
  uan: z.string().optional(),
  
}).refine(data => {
    if (data.locationType === 'rural') return !!data.block && !!data.panchayat;
    return true;
}, { message: "Block and Panchayat are required for Rural locations.", path: ['panchayat'],
}).refine(data => {
    if (data.locationType === 'urban') return !!data.urbanBodyType && !!data.urbanBodyName;
    return true;
}, { message: "Urban Body Type and Name are required for Urban locations.", path: ['urbanBodyName'],
}).refine(data => {
    if (data.isDifferentlyAbled === 'yes') return !!data.differentlyAbledCert?.[0];
    return true;
}, { message: "Certificate is required if differently abled.", path: ['differentlyAbledCert']
}).refine(data => {
    if (data.healthIssues === 'major') return !!data.medicalCert?.[0];
    return true;
}, { message: "Medical certificate is required for major health issues.", path: ['medicalCert']
});


type StaffFormValues = z.infer<typeof staffFormSchema>;

const allowedRoles: StaffUser['designation'][] = ['AO', 'SS', 'AAO', 'SLM', 'ADMIN', 'MIS ASSISTANT', 'DRP', 'BRP'];

export default function StaffRegistrationPage() {
    const { user, loading: authLoading } = useAuth();
    const { users } = useUsers();
    const { toast } = useToast();
    
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
          designation: '',
          recruitmentType: undefined,
          employeeCode: '',
          name: '',
          contactNumber: '',
          photo: undefined,
          locationType: undefined,
          district: '',
          block: '',
          panchayat: '',
          lgdCode: '',
          urbanBodyType: undefined,
          urbanBodyName: '',
          fullAddress: '',
          pincode: '',
          fatherName: '',
          motherName: '',
          spouseName: '',
          religion: '',
          caste: '',
          dateOfBirth: undefined,
          age: '',
          gender: '',
          femaleType: '',
          isDifferentlyAbled: undefined,
          healthIssues: undefined,
          healthIssuesDetails: '',
          differentlyAbledCert: undefined,
          medicalCert: undefined,
          contactNumber2: '',
          emailId: '',
          eportalEmailId: '',
          pfmsId: '',
          bankName: '',
          branchName: '',
          accountNumber: '',
          ifscCode: '',
          aadhaar: '',
          aadhaarUpload: undefined,
          pan: '',
          panUpload: undefined,
          uan: '',
        }
    });
    
    const watchedLocationType = form.watch("locationType");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedUrbanBodyType = form.watch("urbanBodyType");
    const watchedDob = form.watch("dateOfBirth");
    const watchedGender = form.watch("gender");
    const watchedDifferentlyAbled = form.watch("isDifferentlyAbled");
    const watchedHealthIssues = form.watch("healthIssues");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    const urbanBodiesForDistrictAndType = useMemo(() => {
        if(!watchedDistrict || !watchedUrbanBodyType) return [];
        return MOCK_ULBS.filter(u => u.district === watchedDistrict && u.type === watchedUrbanBodyType).sort((a,b) => a.name.localeCompare(b.name));
    }, [watchedDistrict, watchedUrbanBodyType]);

    useEffect(() => {
        if (watchedDistrict) {
            form.setValue("block", "");
            form.setValue("panchayat", "");
            form.setValue("urbanBodyName", "");
        }
    }, [watchedDistrict, form]);

    useEffect(() => {
        if (watchedBlock) {
           form.setValue("panchayat", "");
        }
    }, [watchedBlock, form]);
    
     useEffect(() => {
        if(watchedPanchayat){
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        } else {
            form.setValue('lgdCode', '');
        }
    }, [watchedPanchayat, form]);

    useEffect(() => {
        if (watchedUrbanBodyType) {
            form.setValue("urbanBodyName", "");
        }
    }, [watchedUrbanBodyType, form]);

     useEffect(() => {
        if (watchedDob) {
            const age = differenceInYears(new Date(), watchedDob);
            form.setValue('age', age.toString());
        }
    }, [watchedDob, form]);


    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        form.reset(); // Reset form when role changes
        form.setValue('designation', value);
    };

    const handleEmployeeCodeChange = (employeeCode: string) => {
        const selectedUser = users.find(u => u.employeeCode === employeeCode);
        if (selectedUser) {
            form.setValue('employeeCode', selectedUser.employeeCode);
            form.setValue('name', selectedUser.name);
            form.setValue('contactNumber', selectedUser.mobileNumber);
        }
    };
    
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: "File too large",
                    description: "Photo size must not exceed 5MB."
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue('photo', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredUsersByRole = useMemo(() => {
        if (!selectedRole) return [];
        return users.filter(u => u.designation === selectedRole);
    }, [selectedRole, users]);

    const onSubmit = (data: StaffFormValues) => {
        console.log(data);
        toast({
            title: "Form Section Saved!",
            description: "Your details have been saved for this section.",
        });
    };

    const tabsConfig = [
        { value: "basic-info", label: "Basic Information", roles: ['all'] },
        { value: "location-details", label: "Location Details", roles: ['all'] },
        { value: "family-details", label: "Family Details", roles: ['all'] },
        { value: "personal-details", label: "Personal Details", roles: ['all'] },
        { value: "personal-info", label: "Personal Info", roles: ['all'] },
        { value: "education-experience", label: "Education & Experience", roles: ['all'] },
        { value: "working-details", label: "Working details", roles: ['BRP', 'DRP'] },
        { value: "training-audit", label: "Training & pilot Audit Particulars", roles: ['BRP', 'DRP'] },
    ];

    const visibleTabs = selectedRole 
        ? tabsConfig.filter(tab => tab.roles.includes('all') || tab.roles.includes(selectedRole))
        : [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Registration</CardTitle>
                        <CardDescription>
                            Please select a role to begin the registration process. The form will adapt based on the selected role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="designation"
                                    render={({ field }) => (
                                        <FormItem className="max-w-md">
                                            <FormLabel>Role/Designation</FormLabel>
                                            <Select onValueChange={(value) => {
                                                field.onChange(value);
                                                handleRoleChange(value);
                                            }} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {allowedRoles.map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {selectedRole && (
                                    <Tabs defaultValue={visibleTabs[0].value} className="w-full pt-4">
                                        <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`}}>
                                            {visibleTabs.map(tab => (
                                                <TabsTrigger key={tab.value} value={tab.value} className="text-xs break-words h-full py-2 whitespace-normal">
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        
                                        <TabsContent value="basic-info">
                                            <Card>
                                                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      <FormField
                                                          control={form.control}
                                                          name="photo"
                                                          render={({ field }) => (
                                                              <FormItem>
                                                                  <FormLabel>Photo Upload* (Max 5MB)</FormLabel>
                                                                  <div className="flex items-center gap-4">
                                                                       <Avatar className="h-24 w-24 border">
                                                                          <AvatarImage src={photoPreview || undefined} />
                                                                          <AvatarFallback><Upload /></AvatarFallback>
                                                                      </Avatar>
                                                                      <FormControl>
                                                                           <Input type="file" accept="image/*" onChange={(e) => {
                                                                              field.onChange(e.target.files?.[0]);
                                                                              handlePhotoUpload(e);
                                                                          }} />
                                                                      </FormControl>
                                                                  </div>
                                                                  <FormMessage />
                                                              </FormItem>
                                                          )}
                                                      />
                                                       <FormField
                                                          control={form.control}
                                                          name="recruitmentType"
                                                          render={({ field }) => (
                                                              <FormItem>
                                                                  <FormLabel>Recruitment Type*</FormLabel>
                                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                                      <FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                      <SelectContent>
                                                                          <SelectItem value="direct">Direct</SelectItem>
                                                                          <SelectItem value="retired">Retired</SelectItem>
                                                                      </SelectContent>
                                                                  </Select>
                                                                  <FormMessage />
                                                              </FormItem>
                                                          )}
                                                      />
                                                   </div>
                                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                     <FormField
                                                        control={form.control}
                                                        name="employeeCode"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col">
                                                                <FormLabel>Employee Code*</FormLabel>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                                                                {field.value || "Select Employee Code"}
                                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-[300px] p-0">
                                                                        <Command>
                                                                            <CommandInput placeholder="Search employee code..." onValueChange={handleEmployeeCodeChange} />
                                                                            <CommandEmpty>No employee found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                <CommandList>
                                                                                    {filteredUsersByRole.map((u) => (
                                                                                        <CommandItem
                                                                                            value={u.employeeCode}
                                                                                            key={u.id}
                                                                                            onSelect={() => {
                                                                                                form.setValue("employeeCode", u.employeeCode);
                                                                                                handleEmployeeCodeChange(u.employeeCode);
                                                                                            }}
                                                                                        >
                                                                                            <Check className={cn("mr-2 h-4 w-4", u.employeeCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                                            {u.employeeCode}
                                                                                        </CommandItem>
                                                                                    ))}
                                                                                </CommandList>
                                                                            </CommandGroup>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                      <FormField control={form.control} name="name" render={({ field }) => (
                                                          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>
                                                      )} />
                                                       <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                                          <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>
                                                      )} />
                                                   </div>
                                                   <div className="flex justify-end">
                                                       <Button type="submit">Save</Button>
                                                   </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                         <TabsContent value="location-details">
                                            <Card>
                                                 <CardHeader><CardTitle>Location Details</CardTitle></CardHeader>
                                                 <CardContent className="space-y-6">
                                                     <FormField control={form.control} name="locationType" render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel>Type*</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rural" /></FormControl><FormLabel className="font-normal">Rural</FormLabel></FormItem>
                                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="urban" /></FormControl><FormLabel className="font-normal">Urban</FormLabel></FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                     )} />

                                                    {watchedLocationType === 'rural' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                            <FormField control={form.control} name="district" render={({ field }) => (
                                                                <FormItem><FormLabel>District*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="block" render={({ field }) => (
                                                                <FormItem><FormLabel>Block*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                             <FormField control={form.control} name="panchayat" render={({ field }) => (
                                                                <FormItem><FormLabel>Panchayat*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="lgdCode" render={({ field }) => (
                                                                <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                    )}
                                                     {watchedLocationType === 'urban' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <FormField control={form.control} name="district" render={({ field }) => (
                                                                <FormItem><FormLabel>District*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="urbanBodyType" render={({ field }) => (
                                                                <FormItem><FormLabel>Urban Body Type*</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                                                        <SelectContent>{ULB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                                                                    </Select><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="urbanBodyName" render={({ field }) => (
                                                                <FormItem><FormLabel>Urban Body Name*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedUrbanBodyType}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{urbanBodiesForDistrictAndType.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                     )}
                                                     <FormField control={form.control} name="fullAddress" render={({ field }) => (
                                                        <FormItem><FormLabel>Full Address* (as per Aadhaar)</FormLabel><FormControl><Textarea placeholder="Enter full address" {...field} className="h-28" /></FormControl><FormMessage /></FormItem>
                                                     )} />
                                                     <FormField control={form.control} name="pincode" render={({ field }) => (
                                                        <FormItem className="max-w-xs"><FormLabel>Pincode*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                     )} />

                                                    <div className="flex justify-end mt-8">
                                                        <Button type="submit">Save</Button>
                                                    </div>
                                                 </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="family-details">
                                             <Card>
                                                 <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
                                                 <CardContent className="space-y-6">
                                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                         <FormField control={form.control} name="fatherName" render={({ field }) => (
                                                            <FormItem><FormLabel>Father's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                         <FormField control={form.control} name="motherName" render={({ field }) => (
                                                            <FormItem><FormLabel>Mother's Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                         <FormField control={form.control} name="spouseName" render={({ field }) => (
                                                            <FormItem><FormLabel>Spouse Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                         )} />
                                                     </div>
                                                     <div className="flex justify-end mt-8">
                                                        <Button type="submit">Save</Button>
                                                    </div>
                                                 </CardContent>
                                             </Card>
                                        </TabsContent>
                                        <TabsContent value="personal-details">
                                            <Card>
                                                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                                        <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger></FormControl><SelectContent><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="muslim">Muslim</SelectItem><SelectItem value="chirstian">Christian</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="caste" render={({ field }) => (<FormItem><FormLabel>Caste*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger></FormControl><SelectContent><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="BC">BC</SelectItem><SelectItem value="MBC">MBC</SelectItem><SelectItem value="GENERAL">GENERAL</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                        {watchedGender === 'female' && (<FormField control={form.control} name="femaleType" render={({ field }) => (<FormItem><FormLabel>Female Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="single_women">Single Women</SelectItem><SelectItem value="widow">Widow</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />)}
                                                    </div>
                                                    <div className="space-y-4 pt-4 border-t">
                                                        <h4 className="font-medium">Health Related</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                          <FormField control={form.control} name="isDifferentlyAbled" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Differently Abled?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                                          {watchedDifferentlyAbled === 'yes' && (<FormField control={form.control} name="differentlyAbledCert" render={({ field }) => (<FormItem><FormLabel>Upload Certificate* (Max 5MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                           <FormField control={form.control} name="healthIssues" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Health Issues?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="normal" /></FormControl><FormLabel className="font-normal">Normal</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="minor" /></FormControl><FormLabel className="font-normal">Minor</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="major" /></FormControl><FormLabel className="font-normal">Major</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                                           <div className="space-y-4">
                                                                {(watchedHealthIssues === 'minor' || watchedHealthIssues === 'major') && (<FormField control={form.control} name="healthIssuesDetails" render={({ field }) => (<FormItem><FormLabel>Type of Issues</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                                                {watchedHealthIssues === 'major' && (<FormField control={form.control} name="medicalCert" render={({ field }) => (<FormItem><FormLabel>Upload Medical Certificate* (Max 20MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                                                           </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end mt-8">
                                                        <Button type="submit">Save</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        <TabsContent value="personal-info">
                                            <Card>
                                                <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <FormField control={form.control} name="contactNumber2" render={({ field }) => (<FormItem><FormLabel>Contact 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="emailId" render={({ field }) => (<FormItem><FormLabel>Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="eportalEmailId" render={({ field }) => (<FormItem><FormLabel>E-Portal Email ID*</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="pfmsId" render={({ field }) => (<FormItem><FormLabel>PFMS ID*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="branchName" render={({ field }) => (<FormItem><FormLabel>Branch Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="accountNumber" render={({ field }) => (<FormItem><FormLabel>Account Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="ifscCode" render={({ field }) => (<FormItem><FormLabel>IFSC Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="aadhaar" render={({ field }) => (<FormItem><FormLabel>Aadhaar*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="aadhaarUpload" render={({ field }) => (<FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="pan" render={({ field }) => (<FormItem><FormLabel>PAN*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="panUpload" render={({ field }) => (<FormItem><FormLabel>PAN Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="uan" render={({ field }) => (<FormItem><FormLabel>UAN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                     </div>
                                                     <div className="flex justify-end mt-8">
                                                        <Button type="submit">Save</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        

                                        {visibleTabs.filter(tab => !['basic-info', 'location-details', 'family-details', 'personal-details', 'personal-info'].includes(tab.value)).map(tab => (
                                            <TabsContent key={tab.value} value={tab.value}>
                                                <Card>
                                                    <CardHeader><CardTitle>{tab.label}</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground">Content for {tab.label} will be built here.</p>
                                                        <div className="flex justify-end mt-8">
                                                          <Button type="submit">Save</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                )}

                                {selectedRole && (
                                    <div className="flex justify-end space-x-4 pt-8">
                                        <Button variant="outline" type="button">Preview All Details</Button>
                                        <Button type="submit">Final Submit</Button>
                                    </div>
                                )}
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
