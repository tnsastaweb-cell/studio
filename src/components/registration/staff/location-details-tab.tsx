
'use client';

import React, { useMemo, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from "@/lib/utils";
import { usePanchayats, Panchayat } from '@/services/panchayats';
import { MOCK_ULBS, UrbanLocalBody, ULB_TYPES } from '@/services/ulb';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TabProps {
    form: any;
}

export function LocationDetailsTab({ form }: TabProps) {
    const { control, watch, setValue } = form;
    const { panchayats } = usePanchayats();
    
    const uniqueDistricts = useMemo(() => Array.from(new Set(panchayats.map(p => p.district))).sort(), [panchayats]);

    const watchedLocationType = watch("locationType");
    const watchedDistrict = watch("district");
    const watchedBlock = watch("block");
    const watchedPanchayat = watch("panchayat");
    const watchedUrbanBodyType = watch("urbanBodyType");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(panchayats.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict, panchayats]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return panchayats.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock, panchayats]);
    
    const urbanBodiesForDistrictAndType = useMemo(() => {
        if(!watchedDistrict || !watchedUrbanBodyType) return [];
        return MOCK_ULBS.filter(u => u.district === watchedDistrict && u.type === watchedUrbanBodyType).sort((a,b) => a.name.localeCompare(b.name));
    }, [watchedDistrict, watchedUrbanBodyType]);

    useEffect(() => {
        if (watchedDistrict) {
            setValue("block", "");
            setValue("panchayat", "");
            setValue("urbanBodyName", "");
        }
    }, [watchedDistrict, setValue]);

    useEffect(() => {
        if (watchedBlock) {
           setValue("panchayat", "");
        }
    }, [watchedBlock, setValue]);
    
     useEffect(() => {
        if(watchedPanchayat){
            const lgdCode = panchayats.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            setValue('lgdCode', lgdCode);
        } else {
            setValue('lgdCode', '');
        }
    }, [watchedPanchayat, setValue, panchayats]);

    useEffect(() => {
        if (watchedUrbanBodyType) {
            setValue("urbanBodyName", "");
        }
    }, [watchedUrbanBodyType, setValue]);

    return (
        <div className="space-y-6">
            <FormField control={control} name="locationType" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Type*</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rural" /></FormControl><FormLabel className="font-normal">Rural</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="urban" /></FormControl><FormLabel className="font-normal">Urban</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage />
                </FormItem>
            )} />

            {watchedLocationType === 'rural' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField control={control} name="district" render={({ field }) => (<FormItem><FormLabel>District*</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={control} name="block" render={({ field }) => (<FormItem><FormLabel>Block*</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat*</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={control} name="lgdCode" render={({ field }) => (<FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            )}
            
            {watchedLocationType === 'urban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={control} name="district" render={({ field }) => (<FormItem><FormLabel>District*</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={control} name="urbanBodyType" render={({ field }) => (<FormItem><FormLabel>Urban Body Type*</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl><SelectContent>{ULB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={control} name="urbanBodyName" render={({ field }) => (<FormItem><FormLabel>Urban Body Name*</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedUrbanBodyType}><FormControl><SelectTrigger><SelectValue placeholder="Select Name" /></SelectTrigger></FormControl><SelectContent>{urbanBodiesForDistrictAndType.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
            )}
            <FormField control={control} name="fullAddress" render={({ field }) => (<FormItem><FormLabel>Full Address* (as per Aadhaar)</FormLabel><FormControl><Textarea placeholder="Enter full address" {...field} className="h-28" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={control} name="pincode" render={({ field }) => (<FormItem className="max-w-xs"><FormLabel>Pincode*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
    );
}