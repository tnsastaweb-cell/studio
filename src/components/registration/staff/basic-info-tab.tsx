
'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Upload, ChevronsUpDown, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useUsers, User as StaffUser } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";


interface TabProps {
    form: any;
}

export function BasicInfoTab({ form }: TabProps) {
    const { toast } = useToast();
    const { users } = useUsers();
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isEmployeeCodeOpen, setEmployeeCodeOpen] = useState(false);

    const watchedEmployeeCode = form.watch("employeeCode");

    useEffect(() => {
        // Set initial photo preview if it exists in the form's loaded data
        const existingPhoto = form.getValues('profilePicture');
        if (existingPhoto) {
            setPhotoPreview(existingPhoto);
        }
    }, [form]);
    
     useEffect(() => {
        const selectedUser = users.find(u => u.employeeCode === watchedEmployeeCode);
        if (selectedUser) {
            form.setValue('name', selectedUser.name);
            form.setValue('contactNumber', selectedUser.mobileNumber);
        }
    }, [watchedEmployeeCode, users, form]);


    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ variant: 'destructive', title: "File too large", description: "Photo size must not exceed 5MB." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue('photo', file);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo Upload* (Max 5MB)</FormLabel>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-24 w-24 border">
                                    <AvatarImage src={photoPreview || undefined} />
                                    <AvatarFallback><Upload /></AvatarFallback>
                                </Avatar>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => { field.onChange(e.target.files?.[0]); handlePhotoUpload(e); }} />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="recruitmentType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recruitment Type*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="direct">Direct</SelectItem>
                                    <SelectItem value="retired">Retired</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="employeeCode"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Employee Code*</FormLabel>
                            <Popover open={isEmployeeCodeOpen} onOpenChange={setEmployeeCodeOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("justify-between", !field.value && "text-muted-foreground")}
                                        >
                                            {field.value || "Select Employee Code"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search employee code..." />
                                        <CommandEmpty>No employee found.</CommandEmpty>
                                        <CommandList>
                                            {users.map((u) => (
                                                <CommandItem
                                                    value={u.employeeCode}
                                                    key={u.id}
                                                    onSelect={() => {
                                                        form.setValue("employeeCode", u.employeeCode);
                                                        setEmployeeCodeOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", u.employeeCode === field.value ? "opacity-100" : "opacity-0")} />
                                                    {u.employeeCode}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>
    );
}

