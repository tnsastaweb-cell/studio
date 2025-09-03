
'use client';

import React from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { MOCK_SCHEMES } from '@/services/schemes';
import { FormField, FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface TabProps {
    form: any;
}

export function TrainingAuditTab({ form }: TabProps) {
    const { control } = form;
    const watchedTrainingTaken = useWatch({ control, name: "trainingTaken" });
    const watchedTrainingGiven = useWatch({ control, name: "trainingGiven" });
    const watchedPilotAudit = useWatch({ control, name: "pilotAudit" });
    const watchedStateOfficeActivities = useWatch({ control, name: "stateOfficeActivities" });

    const { fields: trainingTakenFields, append: appendTrainingTaken, remove: removeTrainingTaken } = useFieldArray({ control, name: 'trainingTakenDetails' });
    const { fields: trainingGivenFields, append: appendTrainingGiven, remove: removeTrainingGiven } = useFieldArray({ control, name: 'trainingGivenDetails' });
    const { fields: pilotAuditFields, append: appendPilotAudit, remove: removePilotAudit } = useFieldArray({ control, name: 'pilotAuditDetails' });
    const { fields: stateOfficeFields, append: appendStateOffice, remove: removeStateOffice } = useFieldArray({ control, name: 'stateOfficeActivitiesDetails' });

    return (
        <Tabs defaultValue="training-taken" className="w-full">
            <TabsList>
                <TabsTrigger value="training-taken">Training Taken</TabsTrigger>
                <TabsTrigger value="training-given">Training Given</TabsTrigger>
                <TabsTrigger value="pilot-audit">Pilot Audit</TabsTrigger>
                <TabsTrigger value="state-office-activities">State Office Activities</TabsTrigger>
            </TabsList>
            <TabsContent value="training-taken" className="pt-4">
                <FormField control={control} name="trainingTaken" render={({ field }) => (
                    <FormItem className="mb-4"><FormLabel>Training Taken?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>
                )} />
                {watchedTrainingTaken === 'yes' && (
                    <div className="space-y-4">
                         <Table><TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Location</TableHead><TableHead>Training Name</TableHead><TableHead>Grade</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>{trainingTakenFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={control} name={`trainingTakenDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`trainingTakenDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`trainingTakenDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={control} name={`trainingTakenDetails.${index}.trainingName`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={control} name={`trainingTakenDetails.${index}.grade`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeTrainingTaken(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                         </Table>
                         <Button type="button" variant="outline" size="sm" onClick={() => appendTrainingTaken({ startDate: new Date(), endDate: new Date(), location: '', trainingName: '', grade: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="training-given" className="pt-4">
                <FormField control={control} name="trainingGiven" render={({ field }) => (<FormItem className="mb-4"><FormLabel>Training Given?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                {watchedTrainingGiven === 'yes' && (
                    <div className="space-y-4">
                        <Table><TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Location</TableHead><TableHead>Training Name</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>{trainingGivenFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={control} name={`trainingGivenDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`trainingGivenDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`trainingGivenDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={control} name={`trainingGivenDetails.${index}.trainingName`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeTrainingGiven(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                         </Table>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTrainingGiven({ startDate: new Date(), endDate: new Date(), location: '', trainingName: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="pilot-audit" className="pt-4">
                 <FormField control={control} name="pilotAudit" render={({ field }) => (<FormItem className="mb-4"><FormLabel>Pilot Audit?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                 {watchedPilotAudit === 'yes' && (
                    <div className="space-y-4">
                         <Table><TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Location</TableHead><TableHead>Scheme Name</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                             <TableBody>{pilotAuditFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={control} name={`pilotAuditDetails.${index}.startDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`pilotAuditDetails.${index}.endDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`pilotAuditDetails.${index}.location`} render={({ field }) => <Input {...field} />} /></TableCell><TableCell><FormField control={control} name={`pilotAuditDetails.${index}.schemeName`} render={({ field }) => <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl><SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removePilotAudit(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                         </Table>
                         <Button type="button" variant="outline" size="sm" onClick={() => appendPilotAudit({ startDate: new Date(), endDate: new Date(), location: '', schemeName: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                    </div>
                 )}
            </TabsContent>
            <TabsContent value="state-office-activities" className="pt-4">
                 <FormField control={control} name="stateOfficeActivities" render={({ field }) => (<FormItem className="mb-4"><FormLabel>State Office Activities?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                 {watchedStateOfficeActivities === 'yes' && (
                    <div className="space-y-4">
                         <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Work Particulars</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                             <TableBody>{stateOfficeFields.map((field, index) => (<TableRow key={field.id}><TableCell><FormField control={control} name={`stateOfficeActivitiesDetails.${index}.year`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell><TableCell><FormField control={control} name={`stateOfficeActivitiesDetails.${index}.workParticulars`} render={({ field }) => <Textarea {...field} />} /></TableCell><TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeStateOffice(index)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                         </Table>
                         <Button type="button" variant="outline" size="sm" onClick={() => appendStateOffice({ year: new Date(), workParticulars: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                    </div>
                 )}
            </TabsContent>
        </Tabs>
    );
}
