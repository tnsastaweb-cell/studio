
'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface TabProps {
    form: any;
}

export function PersonalInfoTab({ form }: TabProps) {
    return (
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
            <FormField control={form.control} name="aadhaarUpload" render={({ field }) => (<FormItem><FormLabel>Aadhaar Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="pan" render={({ field }) => (<FormItem><FormLabel>PAN*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="panUpload" render={({ field }) => (<FormItem><FormLabel>PAN Upload*</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="uan" render={({ field }) => (<FormItem><FormLabel>UAN No(Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
    );
}

