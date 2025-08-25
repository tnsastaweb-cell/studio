
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, differenceInYears } from 'date-fns';
import { CalendarIcon, Upload, ChevronsUpDown, Check } from 'lucide-react';

import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User as StaffUser } from '@/services/users';
import { useToast } from '@/hooks/use-toast';

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


const staffFormSchema = z.object({
  designation: z.string().min(1, "Role/Designation is required."),
  photo: z.any().optional(),
  recruitmentType: z.enum(['direct', 'retired'], { required_error: "Recruitment Type is required."}),
  employeeCode: z.string().min(1, "Employee Code is required."),
  name: z.string(),
  contactNumber: z.string(),
  // Add other fields from other tabs with default values here to avoid uncontrolled component errors
  locationType: z.enum(['rural', 'urban']).optional(),
  district: z.string().optional(),
  block: z.string().optional(),
  panchayat: z.string().optional(),
  lgdCode: z.string().optional(),
  urbanBodyType: z.enum(["town_panchayat", "municipality", "corporation"]).optional(),
  urbanBodyName: z.string().optional(),
  fullAddress: z.string().optional(),
  pincode: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  spouseName: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  dob: z.date().optional(),
  age: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  femaleType: z.enum(['none', 'single_women', 'widow']).optional(),
  differentlyAbled: z.enum(['yes', 'no']).optional(),
  differentlyAbledCert: z.any().optional(),
  healthIssues: z.enum(['normal', 'minor', 'major']).optional(),
  healthIssuesDetails: z.string().optional(),
  healthIssuesCert: z.any().optional(),
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
        }
    });

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
            title: "Form Submitted!",
            description: "Staff details have been saved.",
        });
    };

    const tabsConfig = [
        { value: "basic-info", label: "Basic Information", roles: ['all'] },
        { value: "location-details", label: "Location Details", roles: ['all'] },
        { value: "family-details", label: "Family Details", roles: ['all'] },
        { value: "personal-details", label: "Personal Details", roles: ['all'] },
        { value: "personal-info", label: "Personal Info", roles: ['all'] },
        { value: "education-experience", label: "Education & Experience", roles: ['all'] },
        { value: "working-details", label: "Working Details", roles: ['BRP', 'DRP'] },
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
                                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
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
                                                                              field.onChange(e.target.files);
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
                                                                                {field.value ? filteredUsersByRole.find(u => u.employeeCode === field.value)?.employeeCode : "Select Employee Code"}
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
                                                                                            onSelect={() => handleEmployeeCodeChange(u.employeeCode)}
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
                                                       <Button type="button">Save</Button>
                                                   </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {visibleTabs.filter(tab => tab.value !== 'basic-info').map(tab => (
                                            <TabsContent key={tab.value} value={tab.value}>
                                                <Card>
                                                    <CardHeader><CardTitle>{tab.label}</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <p className="text-muted-foreground">Content for {tab.label} will be built here.</p>
                                                        <div className="flex justify-end mt-8">
                                                          <Button type="button">Save</Button>
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

