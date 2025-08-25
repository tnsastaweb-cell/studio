
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useUsers, ROLES, User as StaffUser } from '@/services/users';
import Link from 'next/link';

const roleSelectionSchema = z.object({
  designation: z.string().min(1, "Role/Designation is required."),
});

type RoleSelectionFormValues = z.infer<typeof roleSelectionSchema>;

const allowedRoles = ['AO', 'SS', 'AAO', 'SLM', 'ADMIN', 'MIS ASSISTANT', 'DRP', 'BRP'];

const tabsConfig = [
    { value: "basic-info", label: "Basic Information", roles: ['all'] },
    { value: "location-details", label: "Location Details", roles: ['all'] },
    { value: "family-details", label: "Family Details", roles: ['all'] },
    { value: "personal-details", label: "Personal Details", roles: ['all'] },
    { value: "personal-info", label: "Personal Info", roles: ['all'] },
    { value: "education-experience", label: "Education & Experience", roles: ['all'] },
    { value: "working-details", label: "Working Details", roles: ['BRP', 'DRP', 'DRP I/C'] },
    { value: "training-audit", label: "Training & Pilot Audit Particulars", roles: ['BRP', 'DRP', 'DRP I/C'] }
];

export default function StaffRegistrationPage() {
    const { user, loading } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const form = useForm<RoleSelectionFormValues>({
        resolver: zodResolver(roleSelectionSchema),
    });

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
    };

    const visibleTabs = selectedRole 
        ? tabsConfig.filter(tab => tab.roles.includes('all') || tab.roles.includes(selectedRole))
        : [];
        
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <p>Loading...</p>
                </main>
                <Footer />
                <BottomNavigation />
            </div>
        );
    }
    
    if (!user) {
         return (
             <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                 <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                    <p className="mt-4">You must be signed in to view this page.</p>
                    <Button asChild className="mt-4"><Link href="/signin">Sign In</Link></Button>
                </main>
                <Footer />
                <BottomNavigation />
            </div>
        )
    }

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
                            <form className="space-y-8">
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
                                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-8">
                                             {visibleTabs.map(tab => (
                                                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                                            ))}
                                        </TabsList>
                                        
                                        {visibleTabs.map(tab => (
                                            <TabsContent key={tab.value} value={tab.value}>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>{tab.label}</CardTitle>
                                                    </CardHeader>
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
