
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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


const staffFormSchema = z.object({
  designation: z.string().min(1, "Role/Designation is required."),
  photo: z.any().refine(file => file?.length > 0, "Photo is required."),
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
}).refine(data => {
    if (data.locationType === 'rural') {
        return !!data.block && !!data.panchayat;
    }
    return true;
}, {
    message: "Block and Panchayat are required for Rural locations.",
    path: ['panchayat'],
}).refine(data => {
    if (data.locationType === 'urban') {
        return !!data.urbanBodyType && !!data.urbanBodyName;
    }
    return true;
}, {
    message: "Urban Body Type and Name are required for Urban locations.",
    path: ['urbanBodyName'],
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
            locationType: undefined,
            district: '',
            block: '',
            panchayat: '',
            lgdCode: '',
            urbanBodyType: undefined,
            urbanBodyName: '',
            fullAddress: '',
            pincode: '',
        }
    });
    
    const watchedLocationType = form.watch("locationType");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedUrbanBodyType = form.watch("urbanBodyType");

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
            // We'll leave email to be manually entered as per new instructions
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
        { value: "training-audit", label: "Training & Pilot Audit Particulars", roles: ['BRP', 'DRP'] },
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
                                                                            <CommandInput placeholder="Search employee code..." />
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
                                                                                            {u.employeeCode} - {u.name}
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
                                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
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
                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                             <FormField control={form.control} name="panchayat" render={({ field }) => (
                                                                <FormItem><FormLabel>Panchayat*</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
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
                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedUrbanBodyType}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl>
                                                                    <SelectContent>{urbanBodiesForDistrictAndType.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                                                                </Select><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                     )}
                                                     <FormField control={form.control} name="fullAddress" render={({ field }) => (
                                                        <FormItem><FormLabel>Full Address* (as per Aadhaar)</FormLabel><FormControl><Textarea placeholder="Enter full address" {...field} className="h-24" /></FormControl><FormMessage /></FormItem>
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

                                        {visibleTabs.filter(tab => !['basic-info', 'location-details'].includes(tab.value)).map(tab => (
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

