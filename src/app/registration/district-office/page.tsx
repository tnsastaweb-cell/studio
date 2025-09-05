
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDistrictOffices, DistrictOffice, DISTRICTS } from '@/services/district-offices';
import { Mail, Phone, ExternalLink, Loader2, PlusCircle, Edit, Trash2, MapPin } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const officeFormSchema = z.object({
    district: z.string().min(1, "District is required."),
    buildingName: z.string().min(1, "Building name is required."),
    address: z.string().min(1, "Address is required."),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
    contactPerson: z.string().min(1, "Contact person is required."),
    email: z.string().email("Invalid email address."),
    contactNumbers: z.string().min(10, "Contact number is required."),
    mapsLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type OfficeFormValues = z.infer<typeof officeFormSchema>;


export default function DistrictOfficePage() {
    const { offices, loading: officesLoading, addOffice, updateOffice, deleteOffice } = useDistrictOffices();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<DistrictOffice | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const canEdit = useMemo(() => user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation), [user]);

    const filteredOffices = useMemo(() => {
        if (selectedDistrict === 'all') {
            return offices;
        }
        return offices.filter(office => office.district === selectedDistrict);
    }, [offices, selectedDistrict]);

    const form = useForm<OfficeFormValues>({
        resolver: zodResolver(officeFormSchema),
    });

    useEffect(() => {
        if (isFormOpen) {
            if (editingOffice) {
                form.reset({
                    ...editingOffice,
                    contactNumbers: editingOffice.contactNumbers.join(', '),
                });
            } else {
                form.reset({
                    district: '',
                    buildingName: '',
                    address: '',
                    pincode: '',
                    contactPerson: '',
                    email: '',
                    contactNumbers: '',
                    mapsLink: '',
                });
            }
        }
    }, [editingOffice, form, isFormOpen]);

    const handleAddNewOffice = () => {
        setEditingOffice(null);
        setIsFormOpen(true);
    };

    const handleEditOffice = (office: DistrictOffice) => {
        setEditingOffice(office);
        setIsFormOpen(true);
    };

    const handleDeleteOffice = (officeId: number) => {
        deleteOffice(officeId);
        toast({ title: 'Office Deleted', description: 'The office has been removed successfully.' });
    };

    const onSubmit = (values: OfficeFormValues) => {
        const officeData = {
            ...values,
            contactNumbers: values.contactNumbers.split(',').map(s => s.trim()).filter(Boolean),
            latitude: null, // Not capturing lat/long in form for now
            longitude: null,
        };

        if (editingOffice) {
            updateOffice({ ...editingOffice, ...officeData });
            toast({ title: 'Office Updated', description: 'The office details have been successfully updated.' });
        } else {
            addOffice(officeData);
            toast({ title: 'Office Added', description: 'The new office has been registered.' });
        }
        setIsFormOpen(false);
        setEditingOffice(null);
    };
    
    const handleSetLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocation Not Supported',
                description: 'Your browser does not support geolocation.',
            });
            return;
        }

        setIsLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                form.setValue('mapsLink', mapsLink, { shouldValidate: true });
                toast({
                    title: 'Location Set!',
                    description: 'Google Maps link has been updated with your current location.',
                });
                setIsLoadingLocation(false);
            },
            (error) => {
                let errorMessage = 'Could not retrieve your location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'You denied the request for Geolocation.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                }
                toast({
                    variant: 'destructive',
                    title: 'Location Error',
                    description: errorMessage,
                });
                setIsLoadingLocation(false);
            }
        );
    };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
         <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Our Locations</CardTitle>
                    <CardDescription>
                        Find the contact and location details for our district offices below.
                    </CardDescription>
                </div>
                 <div className="flex w-full md:w-auto gap-4">
                     <div className="w-full md:w-64">
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by District" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     {!authLoading && canEdit && (
                         <Button onClick={handleAddNewOffice}><PlusCircle className="mr-2" /> Register Office</Button>
                     )}
                 </div>
            </CardHeader>
            <CardContent>
                {officesLoading ? (
                     <div className="flex justify-center items-center h-48">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <span className="ml-4">Loading Offices...</span>
                     </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>State/District</TableHead>
                                    <TableHead>Office Address</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">Map</TableHead>
                                     {canEdit && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOffices.length > 0 ? (
                                    filteredOffices.map(office => (
                                       <TableRow key={office.id}>
                                            <TableCell className="font-bold text-primary">{office.district}</TableCell>
                                            <TableCell>
                                                <p className="font-normal text-foreground/90">{office.buildingName},</p>
                                                <p className="font-normal text-foreground/90">{office.address},</p>
                                                <p className="font-normal text-foreground/90">{office.pincode}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-normal text-foreground/90">{office.contactPerson}</p>
                                                <div className="flex items-center gap-2 font-normal text-foreground/90 text-sm">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{office.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-normal text-foreground/90 text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{office.contactNumbers.join(', ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {office.mapsLink && (
                                                    <Button asChild size="sm">
                                                        <a href={office.mapsLink} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> View Map
                                                        </a>
                                                    </Button>
                                                )}
                                            </TableCell>
                                             {canEdit && (
                                                <TableCell className="text-right space-x-2">
                                                     <Button variant="outline" size="sm" onClick={() => handleEditOffice(office)}>
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the office record for {office.district}.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteOffice(office.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                             )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">
                                            No offices found for the selected district.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                 <DialogTitle>{editingOffice ? 'Edit Office Details' : 'Register Office'}</DialogTitle>
                 <DialogDescription>
                    Fill in the details for the office below.
                 </DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="district" render={({ field }) => (
                         <FormItem><FormLabel>State/District</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value}>
                                 <FormControl><SelectTrigger><SelectValue placeholder="Select a District" /></SelectTrigger></FormControl>
                                 <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                             </Select>
                         <FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="buildingName" render={({ field }) => (
                        <FormItem><FormLabel>Building Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="contactPerson" render={({ field }) => (
                        <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                      <FormField control={form.control} name="contactNumbers" render={({ field }) => (
                        <FormItem><FormLabel>Contact Numbers (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                      <FormField control={form.control} name="mapsLink" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Maps Link</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                                <Input {...field} placeholder="https://www.google.com/maps?q=..." />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={handleSetLocation} disabled={isLoadingLocation}>
                                {isLoadingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                <span className="sr-only">Set current location</span>
                            </Button>
                           </div>
                           <FormMessage />
                        </FormItem>
                     )} />
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit">Save Office</Button>
                    </DialogFooter>
                </form>
             </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
}
