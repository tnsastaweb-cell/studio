
'use client';

import React, { useMemo } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { FormField, FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EDUCATION_QUALIFICATIONS } from '@/services/education';


interface TabProps {
    form: any;
}

export function EducationExperienceTab({ form }: TabProps) {
    const { fields: academicFields, append: appendAcademic, remove: removeAcademic } = useFieldArray({ control: form.control, name: "academicDetails" });
    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "workExperience" });
    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });
    
    const uniqueEducationLevels = useMemo(() => Array.from(new Set(EDUCATION_QUALIFICATIONS.map(q => q.level))), []);

    const calculateDuration = (from: Date | undefined, to: Date | undefined) => {
        if (!from || !to) return '';
        const years = differenceInYears(to, from);
        const months = differenceInMonths(to, from) % 12;
        return `${years} years, ${months} months`;
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Academic Details*</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Course</TableHead><TableHead>Institution</TableHead><TableHead>Board/University</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Aggregate %</TableHead><TableHead>Certificate</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {academicFields.map((field, index) => {
                                    const selectedLevel = form.watch(`academicDetails.${index}.level`);
                                    const coursesForLevel = EDUCATION_QUALIFICATIONS.filter(q => q.level === selectedLevel);
                                    
                                    return (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField control={form.control} name={`academicDetails.${index}.level`} render={({ field }) => (
                                                <Select onValueChange={(value) => { field.onChange(value); form.setValue(`academicDetails.${index}.course`, ''); }} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger></FormControl>
                                                    <SelectContent>{uniqueEducationLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                                                </Select>
                                            )} />
                                        </TableCell>
                                        <TableCell>
                                             <FormField control={form.control} name={`academicDetails.${index}.course`} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedLevel}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger></FormControl>
                                                    <SelectContent>{coursesForLevel.map(c => <SelectItem key={c.id} value={c.course}>{c.course}</SelectItem>)}</SelectContent>
                                                </Select>
                                             )} />
                                        </TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.institution`} render={({ field }) => <Input {...field} />} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.board`} render={({ field }) => <Input {...field} />} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.fromYear`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.toYear`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'yyyy') : 'Year'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.aggregate`} render={({ field }) => <div className="flex items-center"><Input type="number" {...field} className="w-24" /><span className="ml-2">%</span></div>} /></TableCell>
                                        <TableCell><FormField control={form.control} name={`academicDetails.${index}.certificate`} render={({ field }) => <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />} /></TableCell>
                                        <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeAcademic(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendAcademic({ level: '', course: '', institution: '', board: '', fromYear: new Date(), toYear: new Date(), aggregate: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Academic Record</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Work Experience*</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Nature of Job</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Duration</TableHead><TableHead>Certificate</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {experienceFields.map((field, index) => {
                                    const fromDate = form.watch(`workExperience.${index}.fromDate`);
                                    const toDate = form.watch(`workExperience.${index}.toDate`);
                                    const duration = calculateDuration(fromDate, toDate);
                                    return (
                                        <TableRow key={field.id}>
                                            <TableCell><FormField control={form.control} name={`workExperience.${index}.companyName`} render={({ field }) => <Input {...field} />} /></TableCell>
                                            <TableCell><FormField control={form.control} name={`workExperience.${index}.natureOfJob`} render={({ field }) => <Input {...field} />} /></TableCell>
                                            <TableCell><FormField control={form.control} name={`workExperience.${index}.fromDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                            <TableCell><FormField control={form.control} name={`workExperience.${index}.toDate`} render={({ field }) => <Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(new Date(field.value), 'PPP') : 'Date'}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover>} /></TableCell>
                                            <TableCell><Input value={duration} readOnly className="bg-muted" /></TableCell>
                                            <TableCell><FormField control={form.control} name={`workExperience.${index}.certificate`} render={({ field }) => <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />} /></TableCell>
                                            <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeExperience(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendExperience({ companyName: '', natureOfJob: '', fromDate: new Date(), toDate: new Date(), duration: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Skills*</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Skill</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {skillFields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell><FormField control={form.control} name={`skills.${index}.skill`} render={({ field }) => <Input {...field} />} /></TableCell>
                                    <TableCell><Button type="button" variant="destructive" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSkill({ skill: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
                </CardContent>
            </Card>
        </div>
    );
}
