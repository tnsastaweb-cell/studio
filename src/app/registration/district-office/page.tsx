
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Trash2, MapPin, Loader2 } from "lucide-react";

import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { useDistrictOffices, DistrictOffice, DISTRICTS } from '@/services/district-offices';
import { cn } from "@/lib/utils";

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const officeFormSchema = z.object({
    district: z.string().min(1, "District is required."),
    buildingName: z.string().min(1, "Building name is required."),
    address: z.string().min(1, "Office address is required."),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    mapsLink: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    contactPerson: z.string().min(1, "Contact person is required."),
    contactNumbers: z.array(z.object({
        value: z.string().regex(/^\d{10}$/, "Must be a 10-digit number.")
    })).min(1, "At least one contact number is required.").max(2, "You can add a maximum of 2 numbers."),
    email: z.string().email("Invalid email address."),
});

type OfficeFormValues = z.infer<typeof officeFormSchema>;

export default function DistrictOfficePage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const { offices, addOffice, updateOffice, deleteOffice, loading: officesLoading } = useDistrictOffices();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<DistrictOffice | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    
    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT', 'DRP', 'DRP I/C'].includes(user.designation);

    const form = useForm<OfficeFormValues>({
        resolver: zodResolver(officeFormSchema),
        defaultValues: {
            district: '',
            buildingName: '',
            address: '',
            pincode: '',
            latitude: null,
            longitude: null,
            mapsLink: '',
            contactPerson: '',
            contactNumbers: [{ value: '' }],
            email: '',
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contactNumbers"
    });

    const handleAddNew = () => {
        setEditingOffice(null);
        form.reset();
        setIsFormOpen(true);
    };

    const handleEdit = (office: DistrictOffice) => {
        setEditingOffice(office);
        form.reset({
            district: office.district,
            buildingName: office.buildingName,
            address: office.address,
            pincode: office.pincode,
            latitude: office.latitude,
            longitude: office.longitude,
            mapsLink: office.mapsLink || '',
            contactPerson: office.contactPerson,
            contactNumbers: office.contactNumbers.map(num => ({ value: num })),
            email: office.email,
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteOffice(id);
        toast({ title: "Success", description: "Office details deleted successfully." });
    };

    const onSubmit = (values: OfficeFormValues) => {
        const officeData = {
            ...values,
            contactNumbers: values.contactNumbers.map(num => num.value)
        };

        if (editingOffice) {
            updateOffice({ ...editingOffice, ...officeData });
            toast({ title: "Success", description: "Office details updated successfully." });
        } else {
            addOffice(officeData);
            toast({ title: "Success", description: "New office details added." });
        }

        setIsFormOpen(false);
        setEditingOffice(null);
    };

    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            toast({ variant: "destructive", title: "Geolocation not supported", description: "Your browser does not support geolocation." });
            return;
        }
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue('latitude', position.coords.latitude);
                form.setValue('longitude', position.coords.longitude);
                setIsFetchingLocation(false);
                toast({ title: "Location captured!" });
            },
            (error) => {
                setIsFetchingLocation(false);
                toast({ variant: "destructive", title: "Error fetching location", description: error.message });
            }
        );
    };

    if (authLoading || officesLoading) {
        return (
             <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <p>Loading...</p>
                </main>
                <Footer />
                <BottomNavigation />
            </div>
        )
    }

    if (!user) {
         return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                 <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                    <p className="mt-4">You must be signed in to view this page.</p>
                    <Button asChild className="mt-6">
                        <Link href="/signin">Sign In</Link>
                    </Button>
                </main>
                <Footer />
                <BottomNavigation />
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
                setEditingOffice(null);
                form.reset();
            }
        }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingOffice ? "Edit District Office" : "Add District Office"}</DialogTitle>
                    <DialogDescription>Fill in the details for the district office.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField control={form.control} name="district" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>District</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a district" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="buildingName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room No. / Building Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                              <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Office Address</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                              <FormField control={form.control} name="pincode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pin Code</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <div className="space-y-2">
                                <FormLabel>GPS Coordinates</FormLabel>
                                <div className="flex gap-2 items-center">
                                    <Input value={form.watch('latitude') ?? ''} placeholder="Latitude" readOnly className="bg-muted"/>
                                    <Input value={form.watch('longitude') ?? ''} placeholder="Longitude" readOnly className="bg-muted"/>
                                    <Button type="button" variant="outline" size="icon" onClick={handleFetchLocation} disabled={isFetchingLocation}>
                                        {isFetchingLocation ? <Loader2 className="animate-spin" /> : <MapPin />}
                                    </Button>
                                </div>
                             </div>
                             <FormField control={form.control} name="mapsLink" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Maps Link (Optional)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <FormField control={form.control} name="contactPerson" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Person</FormLabel>
                                    <FormControl><Input {...field} readOnly={!canEdit} className={!canEdit ? 'bg-muted' : ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Office Email</FormLabel>
                                    <FormControl><Input type="email" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`contactNumbers.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number {index + 1}</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                    {fields.length > 1 && (
                                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                            <Trash2 />
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                {fields.length < 2 && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                        <PlusCircle className="mr-2" /> Add Number
                                    </Button>
                                )}
                             </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Verify & Submit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>


        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>District Office Registration</CardTitle>
                    <CardDescription>
                        Manage district office contact and location details. Total offices: {offices.length}
                    </CardDescription>
                </div>
                {canEdit && (
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Details
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>District</TableHead>
                                <TableHead>Office Address</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Contact Numbers</TableHead>
                                <TableHead>Email</TableHead>
                                {canEdit && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offices.map((office) => (
                                <TableRow key={office.id}>
                                    <TableCell className="font-medium">{office.district}</TableCell>
                                    <TableCell className="max-w-xs">{office.buildingName}, {office.address}, {office.pincode}</TableCell>
                                    <TableCell>{office.contactPerson}</TableCell>
                                    <TableCell>{office.contactNumbers.join(', ')}</TableCell>
                                    <TableCell>{office.email}</TableCell>
                                    {canEdit && (
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(office)}>Edit</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">Delete</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the office details.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(office.id)}>
                                                            Continue
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
