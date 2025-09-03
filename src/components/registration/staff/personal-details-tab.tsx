
'use client';

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { format, differenceInYears } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';


interface TabProps {
    form: any;
}

export function PersonalDetailsTab({ form }: TabProps) {
    const { control, watch, setValue } = form;

    const watchedDob = watch("dateOfBirth");
    const watchedGender = watch("gender");
    const watchedDifferentlyAbled = watch("isDifferentlyAbled");
    const watchedHealthIssues = watch("healthIssues");
    
    useEffect(() => {
        if (watchedDob) {
            const age = differenceInYears(new Date(), new Date(watchedDob));
            setValue('age', age.toString());
        }
    }, [watchedDob, setValue]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <FormField control={control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Religion" /></SelectTrigger></FormControl><SelectContent><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="muslim">Muslim</SelectItem><SelectItem value="christian">Christian</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={control} name="caste" render={({ field }) => (<FormItem><FormLabel>Caste*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Caste" /></SelectTrigger></FormControl><SelectContent><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="BC">BC</SelectItem><SelectItem value="MBC">MBC</SelectItem><SelectItem value="GENERAL">GENERAL</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth*</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                {watchedGender === 'female' && (<FormField control={control} name="femaleType" render={({ field }) => (<FormItem><FormLabel>Female Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="single_women">Single Women</SelectItem><SelectItem value="widow">Widow</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />)}
                <FormField control={control} name="bloodGroup" render={({ field }) => (<FormItem><FormLabel>Blood Group</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A+">A+ (A Positive)</SelectItem><SelectItem value="A-">A- (A Negative)</SelectItem><SelectItem value="B+">B+ (B Positive)</SelectItem><SelectItem value="B-">B- (B Negative)</SelectItem><SelectItem value="AB+">AB+ (AB Positive)</SelectItem><SelectItem value="AB-">AB- (AB Negative)</SelectItem><SelectItem value="O+">O+ (O Positive)</SelectItem><SelectItem value="O-">O- (O Negative)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Health Related</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={control} name="isDifferentlyAbled" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Differently Abled?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                    {watchedDifferentlyAbled === 'yes' && (<FormField control={control} name="differentlyAbledCert" render={({ field }) => (<FormItem><FormLabel>Upload Certificate* (Max 5MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={control} name="healthIssues" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Health Issues?*</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="normal" /></FormControl><FormLabel className="font-normal">Normal</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="minor" /></FormControl><FormLabel className="font-normal">Minor</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="major" /></FormControl><FormLabel className="font-normal">Major</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                    <div className="space-y-4">
                        {(watchedHealthIssues === 'minor' || watchedHealthIssues === 'major') && (<FormField control={control} name="healthIssuesDetails" render={({ field }) => (<FormItem><FormLabel>Type of Issues</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                        {watchedHealthIssues === 'major' && (<FormField control={control} name="medicalCert" render={({ field }) => (<FormItem><FormLabel>Upload Medical Certificate* (Max 20MB)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
