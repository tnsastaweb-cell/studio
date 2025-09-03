
'use client';

import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface TabProps {
    form: any;
}

export function ComplaintsTab({ form }: TabProps) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'complaints'
    });

    return (
         <Tabs defaultValue="complaint" className="w-full">
            <TabsList>
                <TabsTrigger value="complaint">Complaint</TabsTrigger>
                <TabsTrigger value="others">Others</TabsTrigger>
            </TabsList>
            <TabsContent value="complaint" className="pt-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sl.No</TableHead>
                                <TableHead>Received On</TableHead>
                                <TableHead>Complainant Name & Contact</TableHead>
                                <TableHead>Complaint</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Action Taken</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell><FormField control={form.control} name={`complaints.${index}.receivedOn`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                    <TableCell><FormField control={form.control} name={`complaints.${index}.complainantDetails`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                    <TableCell><FormField control={form.control} name={`complaints.${index}.complaint`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                    <TableCell><FormField control={form.control} name={`complaints.${index}.remarks`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                    <TableCell><FormField control={form.control} name={`complaints.${index}.actionTaken`} render={({ field }) => <Textarea {...field} />} /></TableCell>
                                    <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ receivedOn: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Complaint</Button>
            </TabsContent>
            <TabsContent value="others" className="pt-4">
                <p className="text-muted-foreground">This section is under construction.</p>
            </TabsContent>
        </Tabs>
    );
}

