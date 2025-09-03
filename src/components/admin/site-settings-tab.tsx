
'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useLogo } from '@/hooks/use-logo';
import { useToast } from '@/hooks/use-toast';
import { useGallery, galleryActivityTypes, GalleryMediaType, GalleryItem } from '@/services/gallery';
import { useCalendars } from '@/services/calendars';
import { useLibrary, libraryCategories, LibraryItem } from '@/services/library';
import { useHolidays, Holiday } from '@/services/holidays';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { MOCK_SCHEMES } from '@/services/schemes';
import { DISTRICTS_WITH_CODES, DISTRICTS } from '@/services/district-offices';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const galleryFormSchema = z.object({
    mediaType: z.enum(["photo", "video", "news", "blog"]),
    district: z.string().min(1, "District is required."),
    block: z.string().min(1, "Block is required."),
    panchayat: z.string().min(1, "Panchayat is required."),
    scheme: z.string().min(1, "Scheme is required."),
    activityType: z.enum(galleryActivityTypes),
    isWorkRelated: z.enum(["yes", "no"]),
    workName: z.string().optional(),
    workCode: z.string().optional(),
    file: z.any().refine(fileList => fileList.length > 0, "File is required."),
}).refine(data => {
    if (data.isWorkRelated === 'yes') {
        return !!data.workName && !!data.workCode;
    }
    return true;
}, {
    message: "Work Name and Work Code are required when work related is 'Yes'",
    path: ["workName"],
});
type GalleryFormValues = z.infer<typeof galleryFormSchema>;

const calendarFormSchema = z.object({
    scheme: z.string().min(1, "Scheme is required."),
    year: z.string().min(1, "Year is required."),
    district: z.string().min(1, "District is required."),
    type: z.enum(['Calendar', 'Other Letter']),
    file: z.any().refine(file => file?.length > 0, "File is required."),
});
type CalendarFormValues = z.infer<typeof calendarFormSchema>;

const libraryFormSchema = z.object({
    scheme: z.string().min(1, "Scheme is required."),
    category: z.enum(libraryCategories),
    file: z.any().refine(file => file?.[0], "File is required."),
});
type LibraryFormValues = z.infer<typeof libraryFormSchema>;

const holidayFormSchema = z.object({
    date: z.date({ required_error: "Date is required" }),
    name: z.string().min(3, "Holiday name is required"),
});
type HolidayFormValues = z.infer<typeof holidayFormSchema>;

const reportYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
const uniqueDistricts = Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort();

export function SiteSettingsTab() {
    const { user } = useAuth();
    const { logo, setLogo } = useLogo();
    const { toast } = useToast();
    const [logoPreview, setLogoPreview] = useState<string | null>(logo);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { calendars, addCalendar, deleteCalendar } = useCalendars();
    const { addItem: addGalleryItem } = useGallery();
    const { libraryItems, addLibraryItem, deleteLibraryItem } = useLibrary();
    const { holidays, addHoliday, deleteHoliday } = useHolidays();
    const [galleryFile, setGalleryFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isReadyToUpload, setIsReadyToUpload] = useState(false);
    const galleryFileInputRef = React.useRef<HTMLInputElement>(null);
    
    const canManageSettings = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setLogoPreview(dataUrl);
            };
            reader.readAsDataURL(file);
        } else {
            toast({ title: 'Invalid File', description: 'Please upload a PNG file.', variant: 'destructive' });
        }
    };

    const handleSaveLogo = () => {
        if (logoPreview) {
            setLogo(logoPreview);
            toast({ title: 'Logo Updated', description: 'The site logo has been changed successfully.' });
        }
    };
    
    // Gallery Form Logic
    const galleryForm = useForm<GalleryFormValues>({ resolver: zodResolver(galleryFormSchema), defaultValues: { isWorkRelated: "no" } });
    const watchedDistrict = galleryForm.watch("district");
    const watchedBlock = galleryForm.watch("block");
    const watchedPanchayat = galleryForm.watch("panchayat");
    const watchedIsWorkRelated = galleryForm.watch("isWorkRelated");
    const watchedMediaType = galleryForm.watch("mediaType");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);

    const selectedPanchayatLGD = useMemo(() => {
        if (!watchedPanchayat) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat);
        return panchayat ? panchayat.lgdCode : '';
    }, [watchedPanchayat]);
    
    React.useEffect(() => { if (watchedDistrict) { galleryForm.setValue("block", ""); galleryForm.setValue("panchayat", ""); } }, [watchedDistrict, galleryForm]);
    React.useEffect(() => { if (watchedBlock) { galleryForm.setValue("panchayat", ""); } }, [watchedBlock, galleryForm]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFilePreview(null); setGalleryFile(null); setIsReadyToUpload(false);
        if (!file) return;

        const mediaType = galleryForm.getValues("mediaType");
        if (mediaType === 'photo') {
            if (file.size > 5 * 1024 * 1024) { toast({ variant: 'destructive', title: "File too large", description: "Photo size must not exceed 5MB." }); return; }
            const reader = new FileReader();
            reader.onload = (re) => {
                const img = new window.Image();
                img.src = re.target?.result as string;
                img.onload = () => {
                    if (img.width < img.height) { toast({ variant: 'destructive', title: "Invalid Orientation", description: "Please upload landscape photos only." }); } 
                    else { setFilePreview(img.src); setGalleryFile(file); setIsReadyToUpload(true); }
                }
            };
            reader.readAsDataURL(file);
        } else if (mediaType === 'video') {
             if (file.size > 100 * 1024 * 1024) { toast({ variant: 'destructive', title: "File too large", description: "Video size must not exceed 100MB." }); return; }
            setGalleryFile(file); setIsReadyToUpload(true);
        } else {
             setGalleryFile(file); setIsReadyToUpload(true);
        }
    }

    const handleGallerySubmit = (values: GalleryFormValues) => {
        if (!galleryFile) { toast({ variant: "destructive", title: "Upload Failed", description: "No valid file selected." }); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newItem: Omit<GalleryItem, 'id' | 'uploadedAt'> = { ...values, originalFilename: galleryFile.name, dataUrl: dataUrl };
            addGalleryItem(newItem);
            toast({ title: "Upload Successful", description: `${galleryFile.name} has been uploaded.` });
            setTimeout(() => { galleryForm.reset(); if (galleryFileInputRef.current) galleryFileInputRef.current.value = ""; setFilePreview(null); setGalleryFile(null); setIsReadyToUpload(false); }, 1000);
        };
        reader.readAsDataURL(galleryFile);
    };

    const calendarForm = useForm<CalendarFormValues>({ resolver: zodResolver(calendarFormSchema) });
    const handleCalendarSubmit = (values: CalendarFormValues) => {
        const file = values.file?.[0];
        if (!file) { toast({ variant: 'destructive', title: 'File Missing', description: 'Please select a file to upload.' }); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newFilename = `${values.scheme}_${values.district}_${values.year}.pdf`;
            addCalendar({ ...values, originalFilename: file.name, filename: newFilename, dataUrl: dataUrl });
            toast({ title: 'Upload Successful', description: `${newFilename} has been uploaded.` });
            calendarForm.reset(); if (calendarForm.control._fields.file?._f.ref) { (calendarForm.control._fields.file._f.ref as HTMLInputElement).value = ''; }
        }
        reader.readAsDataURL(file);
    };

    const libraryForm = useForm<LibraryFormValues>({ resolver: zodResolver(libraryFormSchema) });
    const handleLibrarySubmit = (values: LibraryFormValues) => {
        const file = values.file?.[0];
        if (!file) { toast({ variant: 'destructive', title: 'File Missing', description: 'Please select a file to upload.' }); return; }
        if (file.size > 100 * 1024 * 1024) { toast({ variant: 'destructive', title: "File too large", description: "File size must not exceed 100MB." }); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            addLibraryItem({ ...values, filename: file.name, size: file.size, dataUrl: dataUrl });
            toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });
            libraryForm.reset(); if (libraryForm.control._fields.file?._f.ref) { (libraryForm.control._fields.file._f.ref as HTMLInputElement).value = ''; }
        }
        reader.readAsDataURL(file);
    };

    const holidayForm = useForm<HolidayFormValues>({ resolver: zodResolver(holidayFormSchema) });
    const onHolidaySubmit = (values: HolidayFormValues) => {
        addHoliday({ ...values, date: format(values.date, 'yyyy-MM-dd') });
        toast({ title: 'Holiday Added', description: `${values.name} has been added.` });
        holidayForm.reset();
    }
    const handleDeleteHoliday = (id: number) => { deleteHoliday(id); toast({ title: 'Holiday Removed' }); }

    return (
        <Tabs defaultValue="logo-upload" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
                <TabsTrigger value="logo-upload">Logo Upload</TabsTrigger>
                <TabsTrigger value="gallery-upload">Gallery Upload</TabsTrigger>
                <TabsTrigger value="calendar-upload">Calendar Upload</TabsTrigger>
                <TabsTrigger value="library-upload">Library Upload</TabsTrigger>
                <TabsTrigger value="holiday-management">Holiday Management</TabsTrigger>
            </TabsList>
            <TabsContent value="logo-upload">
                <Card>
                    <CardHeader><CardTitle>Site Logo</CardTitle><CardDescription>Manage global site settings, such as the logo.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <div><h3 className="text-lg font-medium text-primary">Upload Logo</h3><p className="text-sm text-muted-foreground">Upload a PNG file to be used as the site logo in the header and footer.</p></div>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                                {logoPreview ? <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="object-contain p-1" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" accept="image/png" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                                <Button onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Choose PNG File</Button>
                                <Button onClick={handleSaveLogo} disabled={!logoPreview || logoPreview === logo}>Save Logo</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="gallery-upload">
                <Card>
                    <CardHeader><CardTitle>Gallery Upload</CardTitle><CardDescription>Upload new items to the gallery.</CardDescription></CardHeader>
                    <CardContent>
                        <Form {...galleryForm}>
                            <form onSubmit={galleryForm.handleSubmit(handleGallerySubmit)} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField control={galleryForm.control} name="mediaType" render={({ field }) => (<FormItem><FormLabel>Media Type</FormLabel><Select onValueChange={(value) => { field.onChange(value); setFilePreview(null); setGalleryFile(null); setIsReadyToUpload(false); }} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select media type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="photo">Photo</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="news">News Report</SelectItem><SelectItem value="blog">Blog</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={galleryForm.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={galleryForm.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={galleryForm.control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <div className="space-y-2"><Label>LGD Code</Label><Input value={selectedPanchayatLGD} readOnly className="bg-muted" /></div>
                                    <FormField control={galleryForm.control} name="scheme" render={({ field }) => (<FormItem><FormLabel>Scheme</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger></FormControl><SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={galleryForm.control} name="activityType" render={({ field }) => (<FormItem><FormLabel>Activity Type</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger></FormControl><SelectContent>{galleryActivityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={galleryForm.control} name="isWorkRelated" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Work Related?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value ?? "no"} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                    {watchedIsWorkRelated === 'yes' && (<>
                                        <FormField control={galleryForm.control} name="workName" render={({ field }) => (<FormItem><FormLabel>Work Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={galleryForm.control} name="workCode" render={({ field }) => (<FormItem><FormLabel>Work Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </>)}
                                    <FormField control={galleryForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>Upload File</FormLabel><FormControl><Input ref={galleryFileInputRef} type="file" accept={watchedMediaType === 'photo' ? 'image/jpeg, image/png' : watchedMediaType === 'video' ? 'video/mp4, video/avi, video/mov' : '*'} onChange={(e) => { field.onChange(e.target.files); handleFileChange(e); }} /></FormControl><FormMessage /></FormItem>)} />
                                    {filePreview && watchedMediaType === 'photo' && (<div className="col-span-full"><Label>Photo Preview</Label><div className="mt-2 p-4 border-2 border-dashed border-primary rounded-lg flex justify-center items-center bg-muted/30"><Image src={filePreview} alt="Preview" width={400} height={300} className="rounded-md object-contain max-h-64" /></div></div>)}
                                </div>
                                <Button type="submit" disabled={!isReadyToUpload}><Upload className="mr-2" /> Upload</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="calendar-upload">
                <Card>
                    <CardHeader><CardTitle>Calendar Upload</CardTitle><CardDescription>Upload new audit calendars.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...calendarForm}>
                            <form onSubmit={calendarForm.handleSubmit(handleCalendarSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField control={calendarForm.control} name="scheme" render={({ field }) => (<FormItem><FormLabel>Scheme</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl><SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={calendarForm.control} name="year" render={({ field }) => (<FormItem><FormLabel>Year</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl><SelectContent>{reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={calendarForm.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{DISTRICTS_WITH_CODES.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={calendarForm.control} name="type" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-2 pt-2"><FormItem className="flex items-center space-x-1"><FormControl><RadioGroupItem value="Calendar" /></FormControl><FormLabel className="font-normal text-xs">Calendar</FormLabel></FormItem><FormItem className="flex items-center space-x-1"><FormControl><RadioGroupItem value="Other Letter" /></FormControl><FormLabel className="font-normal text-xs">Other Letter</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={calendarForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>Upload PDF</FormLabel><FormControl><Input type="file" accept=".pdf" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Button type="submit">Upload Calendar</Button>
                            </form>
                        </Form>
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-primary mb-2">Uploaded Calendars</h3>
                            <div className="border rounded-lg max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Filename</TableHead><TableHead>Scheme</TableHead><TableHead>Year</TableHead><TableHead>District</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {calendars.map(cal => (
                                            <TableRow key={cal.id}>
                                                <TableCell className="font-medium">{cal.filename}</TableCell><TableCell>{cal.scheme}</TableCell><TableCell>{cal.year}</TableCell><TableCell>{cal.district}</TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={!canManageSettings}>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the calendar file.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteCalendar(cal.id)}>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="library-upload">
                <Card>
                    <CardHeader><CardTitle>Library Upload</CardTitle><CardDescription>Upload new documents to the library.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...libraryForm}>
                            <form onSubmit={libraryForm.handleSubmit(handleLibrarySubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField control={libraryForm.control} name="scheme" render={({ field }) => (<FormItem><FormLabel>Scheme</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl><SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={libraryForm.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl><SelectContent>{libraryCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={libraryForm.control} name="file" render={({ field }) => (<FormItem><FormLabel>Upload File</FormLabel><FormControl><Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.png,.jpg,.jpeg,.psd,.zip,.rar" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Button type="submit">Upload Document</Button>
                            </form>
                        </Form>
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-primary mb-2">Uploaded Library Items</h3>
                            <div className="border rounded-lg max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Filename</TableHead><TableHead>Scheme</TableHead><TableHead>Category</TableHead><TableHead>Size (KB)</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {libraryItems.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.filename}</TableCell><TableCell>{item.scheme}</TableCell><TableCell>{item.category}</TableCell><TableCell>{(item.size / 1024).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={!canManageSettings}>Delete</Button></AlertDialogTrigger>
                                                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the library file.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteLibraryItem(item.id)}>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="holiday-management">
                <Card>
                    <CardHeader><CardTitle>Holiday Management</CardTitle><CardDescription>Add or remove government holidays for attendance calculation.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...holidayForm}>
                            <form onSubmit={holidayForm.handleSubmit(onHolidaySubmit)} className="flex items-end gap-4">
                                <FormField control={holidayForm.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                <FormField control={holidayForm.control} name="name" render={({ field }) => (<FormItem className="flex-grow"><FormLabel>Holiday Name</FormLabel><FormControl><Input placeholder="e.g., Pongal" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit">Add Holiday</Button>
                            </form>
                        </Form>
                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {holidays.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell>{format(new Date(h.date), "dd MMMM yyyy")}</TableCell>
                                            <TableCell>{h.name}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={!canManageSettings}>Delete</Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the holiday.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteHoliday(h.id)}>Continue</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
