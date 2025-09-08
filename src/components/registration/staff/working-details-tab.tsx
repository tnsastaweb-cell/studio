
'use client';

import React, { useMemo } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { usePanchayats } from '@/services/panchayats';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

interface TabProps {
    form: any;
}

export function WorkingDetailsTab({ form }: TabProps) {
    const { control, watch } = form;
    const { panchayats } = usePanchayats();
    const selectedRole = watch('designation');
    const watchedWorkedAsDrpIc = watch("workedAsDrpIc");

    const uniqueDistricts = useMemo(() => Array.from(new Set(panchayats.map(p => p.district))).sort(), [panchayats]);

    const { fields: brpWorkFields, append: appendBrpWork, remove: removeBrpWork } = useFieldArray({ control, name: "brpWorkHistory" });
    const { fields: drpWorkFields, append: appendDrpWork, remove: removeDrpWork } = useFieldArray({ control, name: "drpWorkHistory" });
    const { fields: drpIcWorkFields, append: appendDrpIcWork, remove: removeDrpIcWork } = useFieldArray({ control, name: "drpIcWorkHistory" });

    const calculateDuration = (from: Date | undefined, to: Date | undefined) => {
        if (!from || !to) return '';
        const years = differenceInYears(to, from);
        const months = differenceInMonths(to, from) % 12;
        return `${years} years, ${months} months`;
    };

    return (
        <div className="space-y-6">
            <FormField control={control} name="joiningDate" render={({ field }) => (
                <FormItem className="flex flex-col max-w-xs"><FormLabel>Joining Date*</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent>
                    </Popover><FormMessage />
                </FormItem>
            )} />

            {selectedRole === 'BRP' && (
                <div className='space-y-6'>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">BRP Working Info*</h3>
                        <div className="overflow-x-auto">
                             <Table>
                                <TableHeader><TableRow><TableHead>Station</TableHead><TableHead>District</TableHead><TableHead>Block</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Duration</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {brpWorkFields.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell><FormField control={control} name={`brpWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                            <TableCell><FormField control={control} name={`brpWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                            <TableCell><FormField control={control} name={`brpWorkHistory.${index}.block`} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""} disabled={!watch(`brpWorkHistory.${index}.district`)}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{panchayats.filter(p=>p.district === watch(`brpWorkHistory.${index}.district`)).map(p => p.block).filter((v, i, a) => a.indexOf(v) === i).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>)} /></TableCell>
                                            <TableCell><FormField control={control} name={`brpWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                            <TableCell><FormField control={control} name={`brpWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                            <TableCell><Input value={calculateDuration(watch(`brpWorkHistory.${index}.fromDate`), watch(`brpWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeBrpWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendBrpWork({ station: 'worked', district: '', block: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                    </div>
                </div>
            )}
            
            {selectedRole === 'DRP' && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">DRP Working Info*</h3>
                    <div className="overflow-x-auto">
                        <Table>
                             <TableHeader><TableRow><TableHead>Station</TableHead><TableHead>District</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Duration</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                             <TableBody>
                             {drpWorkFields.map((item, index) => (
                                 <TableRow key={item.id}>
                                     <TableCell><FormField control={control} name={`drpWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                     <TableCell><FormField control={control} name={`drpWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                     <TableCell><FormField control={control} name={`drpWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                     <TableCell><FormField control={control} name={`drpWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                     <TableCell><Input value={calculateDuration(watch(`drpWorkHistory.${index}.fromDate`), watch(`drpWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                     <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeDrpWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                 </TableRow>
                             ))}
                             </TableBody>
                         </Table>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendDrpWork({ station: 'worked', district: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                </div>
            )}
             
            {(selectedRole === 'BRP' || selectedRole === 'DRP' || selectedRole === 'DRP I/C') && (
                <div className="space-y-4 pt-4 border-t">
                    <FormField control={control} name="workedAsDrpIc" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Have you worked as DRP I/C?*</FormLabel><FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                    {watchedWorkedAsDrpIc === 'yes' && (
                            <div>
                            <h3 className="text-lg font-semibold mb-2">DRP I/C Working Info</h3>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Station</TableHead><TableHead>District</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Duration</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                        {drpIcWorkFields.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell><FormField control={control} name={`drpIcWorkHistory.${index}.station`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="worked">Worked</SelectItem><SelectItem value="present">Present</SelectItem></SelectContent></Select>}/></TableCell>
                                                <TableCell><FormField control={control} name={`drpIcWorkHistory.${index}.district`} render={({field}) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>}/></TableCell>
                                                <TableCell><FormField control={control} name={`drpIcWorkHistory.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                <TableCell><FormField control={control} name={`drpIcWorkHistory.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                                <TableCell><Input value={calculateDuration(watch(`drpIcWorkHistory.${index}.fromDate`), watch(`drpIcWorkHistory.${index}.toDate`))} readOnly className="bg-muted"/></TableCell>
                                                <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeDrpIcWork(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendDrpIcWork({ station: 'worked', district: '', fromDate: new Date(), toDate: new Date() })}><PlusCircle className="mr-2 h-4 w-4" /> Add Station</Button>
                            </div>
                    )}
                </div>
            )}
        </div>
    );
}

    