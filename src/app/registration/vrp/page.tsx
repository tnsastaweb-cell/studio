
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { useToast } from '@/hooks/use-toast';
import { useVRPs, Vrp, baseSchema } from '@/services/vrp';
import { DISTRICTS } from '@/services/district-offices';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { EDUCATION_QUALIFICATIONS } from '@/services/education';
import { useAuth } from '@/hooks/use-auth';

const uniqueDistricts = Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort();
const uniqueEducationLevels = Array.from(new Set(EDUCATION_QUALIFICATIONS.map(q => q.level))).sort();

const yesEmployeeCodeSchema = baseSchema.extend({
  hasEmployeeCode: z.literal("yes"),
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  mgnregaJobCard: z.string().min(1, "MGNREGA Jobcard number is required"),
  mgnregaEmpCode: z.string().min(1, "MGNREGA Employee Code is required"),
});

const noEmployeeCodeSchema = baseSchema.extend({
  hasEmployeeCode: z.literal("no"),
  employeeCode: z.string().min(1, "Please generate an employee code."),
  scheme: z.string().min(1, "Scheme is required"),
  locationType: z.enum(["rural", "urban"]),
  district: z.string().min(1, "District is required"),
  block: z.string().optional(),
  panchayat: z.string().optional(),
  urbanBodyType: z.enum(["town_panchayat", "municipality", "corporation"]).optional(),
  urbanBodyName: z.string().optional(),
}).refine(data => data.locationType === 'urban' || (data.block && data.panchayat), {
  message: "Block and Panchayat are required for rural locations",
  path: ["panchayat"],
}).refine(data => data.locationType === 'rural' || (data.urbanBodyType && data.urbanBodyName), {
  message: "Urban body type and name are required for urban locations",
  path: ["urbanBodyName"],
});


type YesFormValues = z.infer<typeof yesEmployeeCodeSchema>;
type NoFormValues = z.infer<typeof noEmployeeCodeSchema>;

const VrpFormWithCode = () => {
    const { addVrp } = useVRPs();
    const { toast } = useToast();

    const form = useForm<YesFormValues>({
        resolver: zodResolver(yesEmployeeCodeSchema),
        defaultValues: { gender: "Female", hasEmployeeCode: "yes" }
    });

    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    const lgdCode = useMemo(() => {
        if (!watchedPanchayat) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat);
        return panchayat ? panchayat.lgdCode : '';
    }, [watchedPanchayat]);
    
    const age = useMemo(() => {
        const dob = form.watch('dob');
        if (!dob) return '';
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age.toString();
    }, [form.watch('dob')]);
    
     useEffect(() => {
        if (watchedDistrict) {
            form.setValue("block", "");
            form.setValue("panchayat", "");
        }
    }, [watchedDistrict, form]);

    useEffect(() => {
        if (watchedBlock) {
           form.setValue("panchayat", "");
        }
    }, [watchedBlock, form]);

    const onSubmit = (data: YesFormValues) => {
        const panchayatInfo = MOCK_PANCHAYATS.find(p => p.lgdCode === data.panchayat);
        const formattedData: Omit<Vrp, 'id'> = {
            ...data,
            employeeCode: data.mgnregaEmpCode,
            dob: format(data.dob, 'yyyy-MM-dd'),
            age: parseInt(age, 10),
            role: 'VRP',
            panchayatName: panchayatInfo?.name || '',
            block: panchayatInfo?.block || '',
            lgdCode: lgdCode,
        };
        addVrp(formattedData);
        toast({
            title: "Registration Successful!",
            description: `VRP ${data.name} has been registered with Employee Code: ${data.mgnregaEmpCode}`,
        });
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Role Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem><FormLabel>Role</FormLabel><FormControl><Input value="VRP" readOnly className="bg-muted" /></FormControl></FormItem>
                        <FormField control={form.control} name="mgnregaEmpCode" render={({ field }) => (
                            <FormItem><FormLabel>MGNREGA Employee Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Personal & Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name (as per Bank)*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="district" render={({ field }) => (
                            <FormItem>
                                <FormLabel>District*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="block" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Block*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                    <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="panchayat" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Panchayat*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                    <SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input value={lgdCode} readOnly className="bg-muted" /></FormControl></FormItem>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="col-span-1 lg:col-span-3"><FormLabel>Full Address*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pincode" render={({ field }) => (
                            <FormItem><FormLabel>Pincode*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {/* Common fields here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-primary">Family Info</h3>
                        <FormField control={form.control} name="familyRelation" render={({ field }) => (
                            <FormItem className="space-y-2"><FormLabel>Relationship*</FormLabel>
                                <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="father" /></FormControl><FormLabel className="font-normal">Father</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="husband" /></FormControl><FormLabel className="font-normal">Husband</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="familyName" render={({ field }) => (
                            <FormItem><FormLabel>Father/Husband Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-primary">Personal Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="caste" render={({ field }) => (
                                <FormItem><FormLabel>Caste*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="General">General</SelectItem></SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem><FormLabel>Gender*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>
                            )}/>
                        </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="dob" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1950-01-01")} initialFocus /></PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />
                                <FormItem><FormLabel>Age</FormLabel><FormControl><Input value={age} readOnly className="bg-muted" /></FormControl></FormItem>
                        </div>
                         <FormField control={form.control} name="isDifferentlyAbled" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Physically Challenged?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="qualification" render={({ field }) => (
                            <FormItem><FormLabel>Qualification*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Level"/></SelectTrigger></FormControl><SelectContent>{uniqueEducationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contactNumber1" render={({ field }) => (
                            <FormItem><FormLabel>Contact Number 1 (MGNREGA Reg. No)*</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="contactNumber2" render={({ field }) => (
                            <FormItem><FormLabel>Contact Number 2 (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Financial & Identity Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="bankName" render={({ field }) => (
                            <FormItem><FormLabel>Bank Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="branchName" render={({ field }) => (
                            <FormItem><FormLabel>Branch Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                            <FormItem><FormLabel>Account Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="ifscCode" render={({ field }) => (
                            <FormItem><FormLabel>IFSC Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aadhaar" render={({ field }) => (
                            <FormItem><FormLabel>Aadhaar*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="pan" render={({ field }) => (
                            <FormItem><FormLabel>PAN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pfmsId" render={({ field }) => (
                            <FormItem><FormLabel>PFMS ID*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="mgnregaJobCard" render={({ field }) => (
                            <FormItem><FormLabel>MGNREGA Jobcard No.*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="aadhaarUpload" render={({ field }) => (
                            <FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="bankPassbookUpload" render={({ field }) => (
                            <FormItem><FormLabel>Bank Passbook Upload*</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>Clear Form</Button>
                    <Button type="submit">Preview & Submit</Button>
                </div>
            </form>
        </Form>
    )
}

const VrpFormWithoutCode = () => {
    const { addVrp, generateEmployeeCode } = useVRPs();
    const { toast } = useToast();

    const form = useForm<NoFormValues>({
        resolver: zodResolver(noEmployeeCodeSchema),
        defaultValues: { gender: "Female", hasEmployeeCode: "no", employeeCode: "" }
    });

    const locationType = form.watch("locationType");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    const lgdCode = useMemo(() => {
        if (!watchedPanchayat) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat);
        return panchayat ? panchayat.lgdCode : '';
    }, [watchedPanchayat]);
    
    const age = useMemo(() => {
        const dob = form.watch('dob');
        if (!dob) return '';
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age.toString();
    }, [form.watch('dob')]);

    useEffect(() => {
        if (watchedDistrict) {
            form.setValue("block", "");
            form.setValue("panchayat", "");
        }
    }, [watchedDistrict, form]);

    useEffect(() => {
        if (watchedBlock) {
           form.setValue("panchayat", "");
        }
    }, [watchedBlock, form]);
    
    const handleGenerateCode = () => {
        const newCode = generateEmployeeCode();
        form.setValue("employeeCode", newCode);
    }

    const onSubmit = (data: NoFormValues) => {
        let panchayatName = '';
        let blockName = '';

        if (data.locationType === 'rural' && data.panchayat) {
            const panchayatInfo = MOCK_PANCHAYATS.find(p => p.lgdCode === data.panchayat);
            if (panchayatInfo) {
                panchayatName = panchayatInfo.name;
                blockName = panchayatInfo.block;
            }
        }
        
        const formattedData: Omit<Vrp, 'id'> = {
            ...data,
            dob: format(data.dob, 'yyyy-MM-dd'),
            age: parseInt(age, 10),
            role: 'VRP',
            panchayatName: panchayatName,
            block: blockName,
            lgdCode: lgdCode,
        };

        addVrp(formattedData);
        toast({
            title: "Registration Successful!",
            description: `VRP ${data.name} has been registered with Employee Code: ${data.employeeCode}`,
        });
        form.reset();
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Role Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <FormItem><FormLabel>Role</FormLabel><FormControl><Input value="VRP" readOnly className="bg-muted" /></FormControl></FormItem>
                         <FormField control={form.control} name="employeeCode" render={({ field }) => (
                           <FormItem>
                               <FormLabel>Generated Employee Code*</FormLabel>
                               <div className="flex gap-2">
                                  <FormControl><Input {...field} readOnly className="bg-muted" /></FormControl>
                                  <Button type="button" onClick={handleGenerateCode}>Generate</Button>
                               </div>
                               <FormMessage/>
                           </FormItem>
                        )} />

                        <FormField control={form.control} name="scheme" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scheme*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="NMP">NMP</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Personal & Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name (as per Bank)*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="locationType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Type*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Location Type" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="rural">Rural</SelectItem><SelectItem value="urban">Urban</SelectItem></SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="district" render={({ field }) => (
                            <FormItem>
                                <FormLabel>District*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                         {locationType === 'rural' && <>
                            <FormField control={form.control} name="block" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Block*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                        <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="panchayat" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Panchayat*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                        <SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input value={lgdCode} readOnly className="bg-muted" /></FormControl></FormItem>
                        </>}

                        {locationType === 'urban' && <>
                            <FormField control={form.control} name="urbanBodyType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Urban Body Type*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Urban Body Type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="town_panchayat">Town Panchayat</SelectItem>
                                        <SelectItem value="municipality">Municipality</SelectItem>
                                        <SelectItem value="corporation">Corporation</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                            <FormField control={form.control} name="urbanBodyName" render={({ field }) => (
                            <FormItem><FormLabel>Urban Body Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        </>}
                        
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="col-span-1 lg:col-span-3"><FormLabel>Full Address*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="pincode" render={({ field }) => (
                            <FormItem><FormLabel>Pincode*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-primary">Family Info</h3>
                        <FormField control={form.control} name="familyRelation" render={({ field }) => (
                            <FormItem className="space-y-2"><FormLabel>Relationship*</FormLabel>
                                <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="father" /></FormControl><FormLabel className="font-normal">Father</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="husband" /></FormControl><FormLabel className="font-normal">Husband</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="familyName" render={({ field }) => (
                            <FormItem><FormLabel>Father/Husband Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-primary">Personal Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="caste" render={({ field }) => (
                                <FormItem><FormLabel>Caste*</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="General">General</SelectItem></SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem><FormLabel>Gender*</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>
                            )}/>
                        </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="dob" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1950-01-01")} initialFocus /></PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />
                                <FormItem><FormLabel>Age</FormLabel><FormControl><Input value={age} readOnly className="bg-muted" /></FormControl></FormItem>
                        </div>
                        <FormField control={form.control} name="isDifferentlyAbled" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Physically Challenged?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="qualification" render={({ field }) => (
                            <FormItem><FormLabel>Qualification*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Level"/></SelectTrigger></FormControl><SelectContent>{uniqueEducationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contactNumber1" render={({ field }) => (
                            <FormItem><FormLabel>Contact Number 1*</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="contactNumber2" render={({ field }) => (
                            <FormItem><FormLabel>Contact Number 2 (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Financial & Identity Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="bankName" render={({ field }) => (
                            <FormItem><FormLabel>Bank Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="branchName" render={({ field }) => (
                            <FormItem><FormLabel>Branch Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="accountNumber" render={({ field }) => (
                            <FormItem><FormLabel>Account Number*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="ifscCode" render={({ field }) => (
                            <FormItem><FormLabel>IFSC Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="aadhaar" render={({ field }) => (
                            <FormItem><FormLabel>Aadhaar*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                            <FormField control={form.control} name="pan" render={({ field }) => (
                            <FormItem><FormLabel>PAN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pfmsId" render={({ field }) => (
                            <FormItem><FormLabel>PFMS ID*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="aadhaarUpload" render={({ field }) => (
                            <FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="bankPassbookUpload" render={({ field }) => (
                            <FormItem><FormLabel>Bank Passbook Upload*</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </div>
                </div>
                
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>Clear Form</Button>
                    <Button type="submit">Preview & Submit</Button>
                </div>
            </form>
        </Form>
    );
}

export default function VrpRegistrationPage() {
    const { user, loading } = useAuth();
    
    if (loading) return <p>Loading...</p>

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
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
                <Card>
                    <CardHeader>
                        <CardTitle>VRP Registration</CardTitle>
                        <CardDescription>Register a new Village Resource Person (VRP).</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="with-code" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="with-code">With Employee Code</TabsTrigger>
                                <TabsTrigger value="without-code">Without Employee Code</TabsTrigger>
                            </TabsList>
                            <TabsContent value="with-code" className="pt-6">
                                <VrpFormWithCode />
                            </TabsContent>
                            <TabsContent value="without-code" className="pt-6">
                                <VrpFormWithoutCode />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
