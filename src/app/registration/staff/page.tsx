

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { useUsers, User as StaffUser, staffFormSchema } from '@/services/users';
import { useToast } from '@/hooks/use-toast';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Import tab components
import { BasicInfoTab } from '@/components/registration/staff/basic-info-tab';
import { LocationDetailsTab } from '@/components/registration/staff/location-details-tab';
import { FamilyDetailsTab } from '@/components/registration/staff/family-details-tab';
import { PersonalDetailsTab } from '@/components/registration/staff/personal-details-tab';
import { PersonalInfoTab } from '@/components/registration/staff/personal-info-tab';
import { EducationExperienceTab } from '@/components/registration/staff/education-experience-tab';
import { WorkingDetailsTab } from '@/components/registration/staff/working-details-tab';
import { TrainingAuditTab } from '@/components/registration/staff/training-audit-tab';
import { ComplaintsTab } from '@/components/registration/staff/complaints-tab';
import { parseISO, format } from 'date-fns';


export type StaffFormValues = z.infer<typeof staffFormSchema>;

const allowedRoles: StaffUser['designation'][] = ['AO', 'SS', 'AAO', 'SLM', 'ADMIN', 'MIS ASSISTANT', 'DRP', 'BRP'];

export default function StaffRegistrationPage() {
    const { user, loading: authLoading } = useAuth();
    const { users, updateUser: updateUserService, addUser: addUserService } = useUsers();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editEmployeeCode = searchParams.get('edit');

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffFormSchema),
        // Default values are essential to prevent uncontrolled-to-controlled input errors
        defaultValues: {
            designation: '', recruitmentType: undefined, employeeCode: '', name: '',
            contactNumber: '', photo: undefined, locationType: undefined,
            district: '', block: '', panchayat: '', lgdCode: '', urbanBodyType: undefined,
            urbanBodyName: '', fullAddress: '', pincode: '', fatherName: '', motherName: '',
            spouseName: '', religion: '', caste: '', dateOfBirth: undefined, age: '',
            gender: '', femaleType: 'none', bloodGroup: '', isDifferentlyAbled: undefined,
            healthIssues: undefined, healthIssuesDetails: '', differentlyAbledCert: undefined,
            medicalCert: undefined, contactNumber2: '', emailId: '', eportalEmailId: '',
            pfmsId: '', bankName: '', branchName: '', accountNumber: '', ifscCode: '',
            aadhaar: '', aadhaarUpload: undefined, pan: '', panUpload: undefined,
            uan: '', academicDetails: [], workExperience: [], skills: [], joiningDate: undefined,
            brpWorkHistory: [], drpWorkHistory: [], workedAsDrpIc: 'no', drpIcWorkHistory: [],
            trainingTaken: 'no', trainingTakenDetails: [], trainingGiven: 'no',
            trainingGivenDetails: [], pilotAudit: 'no', pilotAuditDetails: [],
            stateOfficeActivities: 'no', stateOfficeActivitiesDetails: [],
            complaints: [], declaration: false,
        }
    });

     useEffect(() => {
        if (editEmployeeCode && users.length > 0) {
            const userToEdit = users.find(u => u.employeeCode === editEmployeeCode);
            if (userToEdit) {
                setEditingUser(userToEdit);
                setIsEditMode(true);
                setSelectedRole(userToEdit.designation);

                const dateFieldsToConvert = ['dateOfBirth', 'joiningDate'];
                const arrayDateFields = {
                    'academicDetails': ['fromYear', 'toYear'],
                    'workExperience': ['fromDate', 'toDate'],
                    'brpWorkHistory': ['fromDate', 'toDate'],
                    'drpWorkHistory': ['fromDate', 'toDate'],
                    'drpIcWorkHistory': ['fromDate', 'toDate'],
                    'trainingTakenDetails': ['startDate', 'endDate'],
                    'trainingGivenDetails': ['startDate', 'endDate'],
                    'pilotAuditDetails': ['startDate', 'endDate'],
                    'stateOfficeActivitiesDetails': ['year'],
                    'complaints': ['receivedOn']
                };

                let formData: any = {...userToEdit};

                dateFieldsToConvert.forEach(field => {
                    if (formData[field] && typeof formData[field] === 'string') {
                        formData[field] = parseISO(formData[field]);
                    }
                });

                Object.entries(arrayDateFields).forEach(([arrayField, dateKeys]) => {
                    if (formData[arrayField] && Array.isArray(formData[arrayField])) {
                        formData[arrayField] = formData[arrayField].map((item: any) => {
                             let newItem: any = {...item};
                             dateKeys.forEach(key => {
                                 if (item[key] && typeof item[key] === 'string') {
                                     newItem[key] = parseISO(item[key]);
                                 }
                             });
                             return newItem;
                        });
                    }
                });
                
                delete formData.aadhaarUpload;
                delete formData.panUpload;
                delete formData.photo;

                form.reset(formData);
            }
        }
    }, [editEmployeeCode, users, form]);
    
    const canViewAndEditComplaints = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        form.reset(); // Reset form when role changes
        form.setValue('designation', value);
    };

    const onSubmit = (data: StaffFormValues) => {
        console.log("Saving section:", data);
        toast({
            title: "Form Section Saved!",
            description: "Your details have been saved for this section.",
        });
    };

    const onFinalSubmit = (data: StaffFormValues) => {
        console.log("Final Submit:", data);
        const finalData:any = { ...data };

        if (isEditMode && editingUser) {
            updateUserService({ ...editingUser, ...finalData });
             toast({
                title: "Registration Updated!",
                description: "The staff details have been successfully updated.",
            });
        } else {
             // addUserService(finalData); This will be for new registration.
             toast({
                title: "Registration Submitted!",
                description: "Your registration has been submitted for review.",
            });
        }
       
        router.push('/admin'); // Redirect to admin panel after submit
    };

    const tabsConfig = [
        { value: "basic-info", label: "Basic Information", roles: ['all'], Component: BasicInfoTab },
        { value: "location-details", label: "Location Details", roles: ['all'], Component: LocationDetailsTab },
        { value: "family-details", label: "Family Details", roles: ['all'], Component: FamilyDetailsTab },
        { value: "personal-details", label: "Personal Details", roles: ['all'], Component: PersonalDetailsTab },
        { value: "personal-info", label: "Personal Info", roles: ['all'], Component: PersonalInfoTab },
        { value: "education-experience", label: "Education & Experience", roles: ['all'], Component: EducationExperienceTab },
        { value: "working-details", label: "Working details", roles: ['BRP', 'DRP', 'DRP I/C'], Component: WorkingDetailsTab },
        { value: "training-audit", label: "Training & pilot Audit Particulars", roles: ['BRP', 'DRP', 'DRP I/C'], Component: TrainingAuditTab },
        { value: "complaints", label: "Complaints", roles: ['BRP', 'DRP', 'DRP I/C'], adminOnly: true, Component: ComplaintsTab },
    ];

    const visibleTabs = selectedRole 
        ? tabsConfig.filter(tab => {
            const roleMatch = tab.roles.includes('all') || tab.roles.includes(selectedRole);
            const adminMatch = !tab.adminOnly || canViewAndEditComplaints;
            return roleMatch && adminMatch;
        })
        : [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditMode ? 'Edit Staff Details' : 'Staff Registration'}</CardTitle>
                        <CardDescription>
                             {isEditMode ? `Editing details for ${editingUser?.name}` : 'Please select a role to begin the registration process. The form will adapt based on the selected role.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-8">
                                {!isEditMode && (
                                    <FormField
                                        control={form.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem className="max-w-md">
                                                <FormLabel>Role/Designation</FormLabel>
                                                <Select onValueChange={(value) => { field.onChange(value); handleRoleChange(value); }} value={field.value || ''} disabled={isEditMode}>
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
                                )}

                                {selectedRole && (
                                    <Tabs defaultValue={visibleTabs[0].value} className="w-full pt-4">
                                        <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))`}}>
                                            {visibleTabs.map(tab => (
                                                <TabsTrigger key={tab.value} value={tab.value} className="text-xs break-words h-full py-2 whitespace-normal">
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        
                                        {visibleTabs.map(tab => (
                                            <TabsContent key={tab.value} value={tab.value}>
                                                <Card>
                                                    <CardHeader><CardTitle>{tab.label}</CardTitle></CardHeader>
                                                    <CardContent className="space-y-6 pt-6">
                                                        <tab.Component form={form} />
                                                        <div className="flex justify-end">
                                                            <Button type="button" onClick={form.handleSubmit(onSubmit)}>Save</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                )}

                                {selectedRole && (
                                     <div className="pt-8 mt-8 border-t space-y-4">
                                        <div className="flex justify-end space-x-4">
                                            <Button variant="outline" type="button">Preview All Details</Button>
                                            <Button type="submit">{isEditMode ? 'Update Details' : 'Final Submit'}</Button>
                                        </div>
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
