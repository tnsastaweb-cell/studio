
'use client';

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface TabProps {
    form: any;
}

export function FamilyDetailsTab({ form }: TabProps) {
    return (
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
    );
}
