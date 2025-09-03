
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMgnregs, MgnregsEntry, ParaParticulars } from '@/services/mgnregs-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, Eye, Delete, ChevronsUpDown, Check, Loader2, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const officialSchema = z.object({
  name: z.string(),
  designation: z.string(),
  in_service: z.boolean().default(false),
});

const photoSchema = z.object({
  dataUrl: z.string(),
  description: z.string().max(200),
});

const highFmFormSchema = z.object({
  // Section 1 is display only
  
  // Section 2: Basic Info (mostly display)
  
  // Section 3: Para Details
  paraNumber: z.string().optional(),
  pageFrom: z.string().optional(),
  pageTo: z.string().optional(),
  paraDescription: z.string().min(1, "Description is required"),

  // Section 4: Data Table
  pastedTableData: z.string().optional(),
  tableData: z.array(z.array(z.string())).optional(),
  
  // Section 5: Evidence
  hasEvidence: z.enum(['yes', 'no']),
  evidencePhotoLayout: z.string().optional(),
  evidencePhotos: z.array(photoSchema).optional(),

  // Section 6: Photo
  hasPhoto: z.enum(['yes', 'no']),
  photoLayout: z.string().optional(),
  photos: z.array(photoSchema).optional(),

  // Section 7: SGS Resolution
  hasSgsResolution: z.enum(['yes', 'no']),
  sgsResolutionLayout: z.string().optional(),
  sgsResolutionPhotos: z.array(photoSchema).optional(),

  // Section 8: Action Taken
  actionTakenOnPara: z.enum(['yes', 'no']),
  actionTakenDetails: z.string().optional(),

  // Section 9: Officials
  officials: z.array(officialSchema).optional(),
});

type HighFmFormValues = z.infer<typeof highFmFormSchema>;

export default function EditHighFmParaDetailsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { entries, updateMgnregsEntry, deleteMgnregsEntry } = useMgnregs();
    const { toast } = useToast();

    const entryId = searchParams.get('id');
    const issueNo = searchParams.get('issueNo');

    const [mgnregsEntry, setMgnregsEntry] = useState<MgnregsEntry | null>(null);
    const [paraDetails, setParaDetails] = useState<ParaParticulars | null>(null);

    const form = useForm<HighFmFormValues>({
        resolver: zodResolver(highFmFormSchema),
        defaultValues: {
            paraDescription: '',
            pastedTableData: '',
            tableData: [],
            hasEvidence: 'no',
            evidencePhotoLayout: '',
            evidencePhotos: [],
            hasPhoto: 'no',
            photoLayout: '',
            photos: [],
            hasSgsResolution: 'no',
            sgsResolutionLayout: '',
            sgsResolutionPhotos: [],
            actionTakenOnPara: 'no',
            actionTakenDetails: '',
            officials: [
                { name: '', designation: 'Worksite FACILITATOR', in_service: false },
                { name: '', designation: 'Scheme Coordinator', in_service: false },
                { name: '', designation: 'Village Panchayat Secretary', in_service: false },
                { name: '', designation: 'Village Panchayat President', in_service: false },
                { name: '', designation: 'Computer Operator', in_service: false },
                { name: '', designation: 'Union OVERSEER', in_service: false },
                { name: '', designation: 'Union Engineer / Assistant Engineer', in_service: false },
                { name: '', designation: 'ZONAL Deputy Block Development Officer', in_service: false },
                { name: '', designation: 'Deputy Block Development Officer (MGNREGS)', in_service: false },
                { name: '', designation: 'Block Development Officer (Village Panchayat)', in_service: false },
            ]
        },
    });
    
    useEffect(() => {
        if (entryId && issueNo && entries.length > 0) {
            const entry = entries.find(e => e.id === parseInt(entryId, 10));
            if (entry) {
                const para = entry.paraParticulars?.find(p => p.issueNumber === issueNo);
                setMgnregsEntry(entry);
                setParaDetails(para || null);
                if (para) {
                    form.reset(para as any); // Reset form with existing para details
                }
            }
        }
    }, [entryId, issueNo, entries, form]);
    
    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const watchedEvidence = form.watch("hasEvidence");
    const watchedPhoto = form.watch("hasPhoto");
    const watchedSgsResolution = form.watch("hasSgsResolution");
    const watchedActionTaken = form.watch("actionTakenOnPara");
    
    const { fields: evidencePhotoFields, append: appendEvidencePhoto, remove: removeEvidencePhoto } = useFieldArray({ control: form.control, name: 'evidencePhotos' });
    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control: form.control, name: 'photos' });
    const { fields: sgsPhotoFields, append: appendSgsPhoto, remove: removeSgsPhoto } = useFieldArray({ control: form.control, name: 'sgsResolutionPhotos' });
    const { fields: officialFields } = useFieldArray({ control: form.control, name: 'officials' });
    
    const handleParseTable = () => {
        const textData = form.getValues('pastedTableData') || '';
        const rows = textData.split('\n').filter(row => row.trim() !== '');
        if (rows.length === 0) {
            form.setValue('tableData', []);
            return;
        }
        const parsedData = rows.map(row => row.split('\t'));
        form.setValue('tableData', parsedData);
        toast({ title: "Table Parsed", description: `Created a table with ${parsedData.length} rows and ${parsedData[0]?.length || 0} columns.`});
    };
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, fieldName: 'evidencePhotos' | 'photos' | 'sgsResolutionPhotos') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: "File too large", description: "Photo must be 5MB or smaller." });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const currentPhotos = form.getValues(fieldName) || [];
            currentPhotos[index].dataUrl = reader.result as string;
            form.setValue(fieldName, [...currentPhotos]);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = (data: HighFmFormValues) => {
        if (!mgnregsEntry || !paraDetails) {
            toast({ variant: 'destructive', title: 'Error', description: 'Original entry not found.' });
            return;
        }
        
        const updatedPara = { ...paraDetails, ...data, isReportSubmitted: true };
        const updatedParas = mgnregsEntry.paraParticulars?.map(p => p.issueNumber === issueNo ? updatedPara : p) || [];
        const updatedEntry = { ...mgnregsEntry, paraParticulars: updatedParas };
        
        updateMgnregsEntry(updatedEntry);

        toast({ title: 'Success!', description: 'High FM Para details have been updated.' });
        router.push('/sa-reports/high-fm-para-details');
    };
    
    const handleDelete = () => {
        if (mgnregsEntry) {
            deleteMgnregsEntry(mgnregsEntry.id);
            toast({ title: "Deleted!", description: `Entry for ${mgnregsEntry.panchayatName} has been deleted.` });
            router.push('/sa-reports/high-fm-para-details');
        }
    }

    if (authLoading || !mgnregsEntry || !paraDetails) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === mgnregsEntry.panchayat)?.name || '';

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                             <CardHeader className="text-center space-y-2">
                                <CardTitle className="text-2xl font-bold">மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம் (MGNREGS)</CardTitle>
                                <CardDescription className="text-lg font-semibold">தீவிர முறைகேடுகள் குறித்த அறிக்கை</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                
                                <section>
                                    <h3 className="text-xl font-bold text-primary mb-4">1. MGNREGS – ISSUE NO – {issueNo}</h3>
                                </section>
                                
                                <section>
                                     <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">BASIC INFORMATION</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                         <div><strong>DISTRICT:</strong> {mgnregsEntry.district}</div>
                                         <div><strong>BLOCK:</strong> {mgnregsEntry.block}</div>
                                         <div><strong>PANCHAYAT:</strong> {panchayatName}</div>
                                         <div><strong>LGD CODE:</strong> {mgnregsEntry.lgdCode}</div>
                                         <div><strong>SGS DATE:</strong> {mgnregsEntry.sgsDate ? new Date(mgnregsEntry.sgsDate).toLocaleDateString() : ''}</div>
                                         <div><strong>ROUND NO:</strong> {mgnregsEntry.roundNo}</div>
                                         <div><strong>BRP NAME:</strong> {mgnregsEntry.brpName}</div>
                                         <div><strong>EMPLOYEE CODE:</strong> {mgnregsEntry.brpEmployeeCode}</div>
                                         <div><strong>DRP / DRP I/C NAME:</strong> {mgnregsEntry.drpName}</div>
                                         <div><strong>EMPLOYEE CODE:</strong> {mgnregsEntry.drpEmployeeCode}</div>
                                     </div>
                                </section>
                                
                                <section>
                                     <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">PARA DETAILS</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                          <p><strong>Type:</strong> {paraDetails.type}</p>
                                          <p><strong>Category:</strong> {paraDetails.category}</p>
                                          <p className="md:col-span-2"><strong>Sub-Category:</strong> {paraDetails.subCategory}</p>
                                          <p><strong>Amount:</strong> ₹{paraDetails.amount?.toLocaleString()}</p>
                                          <p><strong>Issue Code:</strong> {paraDetails.codeNumber}</p>
                                          <div className="flex items-center gap-4">
                                             <FormField control={form.control} name="paraNumber" render={({ field }) => (<FormItem className="flex-1"><FormLabel>PARA NUMBER :</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                          </div>
                                           <div className="flex items-center gap-4">
                                             <FormField control={form.control} name="pageFrom" render={({ field }) => (<FormItem className="flex-1"><FormLabel>PAGE NO : FROM :</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                             <FormField control={form.control} name="pageTo" render={({ field }) => (<FormItem className="flex-1"><FormLabel>TO :</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                          </div>
                                      </div>
                                      <div className="mt-4">
                                          <FormField control={form.control} name="paraDescription" render={({ field }) => (<FormItem><FormLabel>PARA DESCRIPTION :</FormLabel><FormControl><Textarea className="h-32" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                      </div>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Data Table</h3>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Paste table data from Excel or Word. Columns should be separated by tabs, and rows by new lines.</p>
                                        <FormField control={form.control} name="pastedTableData" render={({ field }) => (
                                            <FormItem><FormLabel>Paste Table Data Here</FormLabel><FormControl><Textarea className="h-40 font-mono" {...field} /></FormControl></FormItem>
                                        )} />
                                        <Button type="button" onClick={handleParseTable}>Parse Table from Text</Button>

                                         {form.watch("tableData") && form.watch("tableData")!.length > 0 && (
                                            <div className="space-y-2 pt-4">
                                                <h4 className="font-semibold">Parsed Table Preview:</h4>
                                                <div className="border rounded-lg overflow-x-auto">
                                                    <table className="w-full text-sm table-auto">
                                                        <tbody>
                                                            {form.watch("tableData")!.map((row, rowIndex) => (
                                                                <tr key={rowIndex}>
                                                                    {row.map((cell, colIndex) => (
                                                                        <td key={colIndex} className="font-normal border p-2 text-center whitespace-normal break-words">{cell}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                         )}
                                    </div>
                                </section>
                                
                                <section className="space-y-4">
                                  <FormField control={form.control} name="hasEvidence" render={({ field }) => (<FormItem><FormLabel>EVIDENCE</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                  {watchedEvidence === 'yes' && (
                                      <div className="space-y-4 pl-4 border-l-2">
                                           <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                               {evidencePhotoFields.map((item, index) => ( <div key={item.id} className="border p-2 rounded-lg space-y-2"><Image src={form.watch(`evidencePhotos.${index}.dataUrl`) || '/placeholder.svg'} alt={`Photo ${index+1}`} width={300} height={200} className="w-full h-auto object-contain rounded-md bg-muted" /><Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, index, 'evidencePhotos')} /><Textarea placeholder={`Description for photo ${index+1}...`} {...form.register(`evidencePhotos.${index}.description`)} /></div>))}
                                           </div>
                                            <Button type="button" onClick={() => appendEvidencePhoto({ dataUrl: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Evidence Photo</Button>
                                      </div>
                                  )}
                                </section>
                                
                                <section className="space-y-4">
                                   <FormField control={form.control} name="hasPhoto" render={({ field }) => ( <FormItem><FormLabel>PHOTO</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                    {watchedPhoto === 'yes' && (
                                        <div className="space-y-4 pl-4 border-l-2">
                                             <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                {photoFields.map((item, index) => ( <div key={item.id} className="border p-2 rounded-lg space-y-2"><Image src={form.watch(`photos.${index}.dataUrl`) || '/placeholder.svg'} alt={`Photo ${index+1}`} width={300} height={200} className="w-full h-auto object-contain rounded-md bg-muted" /><Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, index, 'photos')} /><Textarea placeholder={`Description for photo ${index+1}...`} {...form.register(`photos.${index}.description`)} /></div>))}
                                            </div>
                                             <Button type="button" onClick={() => appendPhoto({ dataUrl: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Photo</Button>
                                        </div>
                                    )}
                                </section>
                                
                                 <section className="space-y-4">
                                     <FormField control={form.control} name="hasSgsResolution" render={({ field }) => ( <FormItem><FormLabel>SGS RESULATION</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                      {watchedSgsResolution === 'yes' && (
                                         <div className="space-y-4 pl-4 border-l-2">
                                             <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                 {sgsPhotoFields.map((item, index) => ( <div key={item.id} className="border p-2 rounded-lg space-y-2"><Image src={form.watch(`sgsResolutionPhotos.${index}.dataUrl`) || '/placeholder.svg'} alt={`Photo ${index+1}`} width={300} height={200} className="w-full h-auto object-contain rounded-md bg-muted" /><Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, index, 'sgsResolutionPhotos')} /><Textarea placeholder={`Description for photo ${index+1}...`} {...form.register(`sgsResolutionPhotos.${index}.description`)} /></div>))}
                                             </div>
                                            <Button type="button" onClick={() => appendSgsPhoto({ dataUrl: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add SGS Resolution Photo</Button>
                                         </div>
                                     )}
                                 </section>
                                 
                                <section className="space-y-4">
                                     <FormField control={form.control} name="actionTakenOnPara" render={({ field }) => ( <FormItem><FormLabel>Action Taken on the Para</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>No</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                     {watchedActionTaken === 'yes' && (
                                         <FormField control={form.control} name="actionTakenDetails" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="If the matter has been addressed in the Gram Sabha, or thereafter, or if the money has been refunded, or any other action has been taken, please specify." className="h-28" {...field} /></FormControl><FormMessage/></FormItem>)} />
                                     )}
                                </section>
                                
                                <section>
                                     <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Officials in Service During the Period of Financial Irregularity</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                         {officialFields.map((field, index) => (
                                              <FormField key={field.id} control={form.control} name={`officials.${index}.name`} render={({ field }) => (
                                                 <FormItem>
                                                     <FormLabel>{`• ${form.getValues(`officials.${index}.designation`)}`}</FormLabel>
                                                     <FormControl><Input {...field} /></FormControl>
                                                 </FormItem>
                                              )} />
                                         ))}
                                     </div>
                                </section>

                                 <div className="flex justify-end gap-4 mt-8">
                                     <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
                                     <Button type="submit">Submit</Button>
                                     {canEdit && (
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button type="button" variant="destructive">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the entire MGNREGS entry for {panchayatName}.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                         </AlertDialog>
                                     )}
                                 </div>
                                
                            </CardContent>
                        </Card>
                    </form>
                 </Form>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

    