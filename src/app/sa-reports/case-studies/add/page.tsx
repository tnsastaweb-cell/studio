
'use client';

import React, { useState, useMemo, useEffect, FC } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MOCK_SCHEMES } from '@/services/schemes';
import { useUsers, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useCaseStudies, CaseStudy } from '@/services/case-studies';
import { useMgnregs, MgnregsEntry, paraParticularsSchema as mgnregsParaSchema } from '@/services/mgnregs-data';
import { usePmayg, PmaygEntry, pmaygFormSchema } from '@/services/pmayg-data';


import { uniqueDistricts, toTitleCase } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';


import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, Mic, Upload, Eye, Delete } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';


const photoSchema = z.object({
    dataUrl: z.string(),
    description: z.string().max(200).optional(),
});

const caseStudySchema = z.object({
  caseStudyNo: z.string(),
  scheme: z.string().min(1),
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  lgdCode: z.string(),
  
  employeeCode: z.string().optional(),
  brpName: z.string().optional(),
  roundNo: z.string().optional(),
  sgsDate: z.string().optional(),

  paraNo: z.string().optional(),
  issueNo: z.string().optional(),
  issueType: z.string().optional(),
  issueCategory: z.string().optional(),
  subCategory: z.string().optional(),
  issueCode: z.string().optional(),
  beneficiaries: z.coerce.number().optional(),
  
  // MGNREGS amount
  amount: z.coerce.number().optional(),

  // PMAY-G amounts
  centralAmount: z.coerce.number().optional(),
  stateAmount: z.coerce.number().optional(),
  otherAmount: z.coerce.number().optional(),
  
  description: z.string().optional(),

  pastedTableData: z.string().optional(),
  tableData: z.array(z.array(z.string())).optional(),
  photoLayout: z.string().optional(),
  photos: z.array(photoSchema).optional(),
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function AddCaseStudyPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    const { getNextCaseStudyNumber, addCaseStudy, caseStudies, updateCaseStudy } = useCaseStudies();
    const { entries: mgnregsEntries } = useMgnregs();
    const { entries: pmaygEntries } = usePmayg();

    const [caseStudyNo, setCaseStudyNo] = useState('');

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const form = useForm<CaseStudyFormValues>({
        resolver: zodResolver(caseStudySchema),
        defaultValues: {
            caseStudyNo: '', scheme: MOCK_SCHEMES[0].name, district: '', block: '', panchayat: '', lgdCode: '',
            employeeCode: '', brpName: '', paraNo: '', issueNo: '', issueType: '', issueCategory: '', subCategory: '', issueCode: '',
            beneficiaries: 0, description: '', amount: 0, centralAmount: 0, stateAmount: 0, otherAmount: 0,
            tableData: [], pastedTableData: '', photoLayout: '', photos: [],
        },
    });
    
    useEffect(() => {
        if(editId) {
            const existingCaseStudy = caseStudies.find(cs => cs.caseStudyNo === editId);
            if (existingCaseStudy) {
                form.reset(existingCaseStudy);
                setCaseStudyNo(existingCaseStudy.caseStudyNo);
            }
        }
    }, [editId, caseStudies, form]);

    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control: form.control, name: 'photos' });

    const watchedScheme = form.watch("scheme");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedIssueNo = form.watch("issueNo");

    const blocks = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a,b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);

    useEffect(() => {
        if (watchedPanchayat) {
            const lgdCode = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat)?.lgdCode || '';
            form.setValue('lgdCode', lgdCode);
        }
    }, [watchedPanchayat, form]);

    useEffect(() => {
        if (watchedDistrict && !editId) {
            const newCaseStudyNo = getNextCaseStudyNumber(watchedDistrict);
            setCaseStudyNo(newCaseStudyNo);
            form.setValue('caseStudyNo', newCaseStudyNo);
        }
    }, [watchedDistrict, getNextCaseStudyNumber, form, editId]);
    
    const handleIssueBlur = () => {
      let issueData: any;
      let entryData: MgnregsEntry | PmaygEntry | undefined;

      if (watchedScheme === 'MGNREGS') {
        mgnregsEntries.forEach(entry => {
            const foundPara = entry.paraParticulars?.find(p => p.issueNumber === watchedIssueNo);
            if(foundPara) {
                issueData = foundPara;
                entryData = entry;
            }
        })
      } else if (watchedScheme === 'PMAY-G') {
         pmaygEntries.forEach(entry => {
            const foundPara = entry.paraParticulars?.find(p => p.issueNumber === watchedIssueNo);
            if(foundPara) {
                issueData = foundPara;
                entryData = entry;
            }
        })
      }

      if (issueData && entryData) {
        form.setValue('issueType', issueData.type);
        form.setValue('issueCategory', issueData.category);
        form.setValue('subCategory', issueData.subCategory);
        form.setValue('issueCode', issueData.codeNumber);
        form.setValue('brpName', entryData.brpName);
        form.setValue('employeeCode', entryData.brpEmployeeCode);
        form.setValue('roundNo', entryData.roundNo);
        form.setValue('sgsDate', entryData.sgsDate ? new Date(entryData.sgsDate).toLocaleDateString() : '');
        form.setValue('beneficiaries', issueData.beneficiaries || 0);

        if(watchedScheme === 'MGNREGS') form.setValue('amount', issueData.amount || 0);
        if(watchedScheme === 'PMAY-G') {
            form.setValue('centralAmount', issueData.centralAmount || 0);
            form.setValue('stateAmount', issueData.stateAmount || 0);
            form.setValue('otherAmount', issueData.otherAmount || 0);
        }

      } else {
        // Clear fields if not found
        form.setValue('issueType', '');
        form.setValue('issueCategory', '');
        form.setValue('subCategory', '');
        form.setValue('issueCode', '');
        form.setValue('brpName', '');
        form.setValue('employeeCode', '');
        form.setValue('roundNo', '');
        form.setValue('sgsDate', '');
      }
    };


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
    
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: "File too large", description: "Photo must be 5MB or smaller." });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const currentPhotos = form.getValues('photos') || [];
            currentPhotos[index].dataUrl = reader.result as string;
            form.setValue('photos', [...currentPhotos]);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = (data: CaseStudyFormValues) => {
        if(editId) {
            const existingCaseStudy = caseStudies.find(cs => cs.caseStudyNo === editId);
            if(existingCaseStudy) {
                updateCaseStudy({ ...data, id: existingCaseStudy.id });
                toast({ title: "Success!", description: `Case Study ${data.caseStudyNo} has been updated.` });
            }
        } else {
            addCaseStudy(data);
            toast({ title: "Success!", description: `Case Study ${data.caseStudyNo} has been saved.` });
        }
        router.push('/sa-reports/case-studies/view');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <Card>
                            <CardHeader><CardTitle>Add/Edit Case Study</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue={MOCK_SCHEMES[0].name} onValueChange={(val) => form.setValue('scheme', val)} value={watchedScheme}>
                                    <TabsList>
                                    {MOCK_SCHEMES.map(s => <TabsTrigger key={s.id} value={s.name} disabled={!['MGNREGS', 'PMAY-G'].includes(s.name)}>{s.name}</TabsTrigger>)}
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                         </Card>

                        <Card>
                            <CardHeader><CardTitle>🧾 Section 1: Basic Case Info</CardTitle></CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="caseStudyNo" render={({ field }) => (
                                    <FormItem><FormLabel>Case Study No</FormLabel><FormControl><Input {...field} value={caseStudyNo} readOnly className="bg-muted w-1/3" /></FormControl></FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>🗺️ Section 2: Location</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="lgdCode" render={({ field }) => (<FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                            </CardContent>
                        </Card>

                        <Card>
                                <CardHeader><CardTitle>🧑 Section 3: Issue Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <FormField control={form.control} name="issueNo" render={({ field }) => (<FormItem><FormLabel>Issue No.</FormLabel><FormControl><Input {...field} onBlur={handleIssueBlur} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="paraNo" render={({ field }) => (<FormItem><FormLabel>Para No.</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="brpName" render={({ field }) => (<FormItem><FormLabel>BRP Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="employeeCode" render={({ field }) => (<FormItem><FormLabel>Employee Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="roundNo" render={({ field }) => (<FormItem><FormLabel>Round No.</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="sgsDate" render={({ field }) => (<FormItem><FormLabel>SGS Date</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="issueType" render={({ field }) => (<FormItem><FormLabel>Issue Type</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="issueCategory" render={({ field }) => (<FormItem><FormLabel>Issue Category</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="issueCode" render={({ field }) => (<FormItem><FormLabel>Issue Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="beneficiaries" render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                        {watchedScheme === 'MGNREGS' && <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />}
                                        {watchedScheme === 'PMAY-G' && (
                                            <>
                                                <FormField control={form.control} name="centralAmount" render={({ field }) => (<FormItem><FormLabel>Central Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="stateAmount" render={({ field }) => (<FormItem><FormLabel>State Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="otherAmount" render={({ field }) => (<FormItem><FormLabel>Others Amount</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                            </>
                                        )}
                                    </div>
                                    <div className="lg:col-span-4">
                                        <FormField control={form.control} name="subCategory" render={({ field }) => (
                                            <FormItem><FormLabel>Sub Category</FormLabel><FormControl><Textarea readOnly {...field} className="bg-muted min-h-[80px]" /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                        </Card>

                        <Card>
                             <CardHeader><CardTitle>📝 Section 4: Description</CardTitle></CardHeader>
                             <CardContent>
                                 <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Case Study Description</FormLabel>
                                            <FormControl>
                                                 <div className="relative">
                                                     <Textarea placeholder="Enter the full case study description here..." className="h-48 pr-10" {...field} />
                                                     <Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground"><Mic className="h-4 w-4"/></Button>
                                                 </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Data Table</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Paste your table data from Excel or Word into the text area below. Columns should be separated by tabs, and rows by new lines.</p>
                                <FormField control={form.control} name="pastedTableData" render={({ field }) => (
                                    <FormItem><FormLabel>Paste Table Data Here</FormLabel><FormControl><Textarea className="h-40 font-mono" {...field} /></FormControl></FormItem>
                                )} />
                                <Button type="button" onClick={handleParseTable}>Parse Table from Text</Button>

                                {form.watch("tableData") && form.watch("tableData")!.length > 0 && (
                                    <div className="space-y-2 pt-4">
                                        <h4 className="font-semibold">Parsed Table Preview:</h4>
                                        <div className="border rounded-lg overflow-x-auto">
                                            <Table>
                                                <TableBody>
                                                    {form.watch("tableData")!.map((row, rowIndex) => (
                                                        <TableRow key={rowIndex}>
                                                            {row.map((cell, colIndex) => (
                                                                <TableCell key={colIndex} className="font-normal border p-2 text-center whitespace-normal break-words">{cell}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>🖼️ Section 6: Photo Upload</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="photoLayout" render={({ field }) => (
                                    <FormItem><FormLabel>Photo Layout</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                        <FormControl><SelectTrigger className="w-1/3"><SelectValue placeholder="Select layout" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="a4-1">A4 Full (1 photo)</SelectItem>
                                            <SelectItem value="a4-2">A4 Split 2 (2 photos)</SelectItem>
                                            <SelectItem value="a4-4">A4 Split 4 (4 photos)</SelectItem>
                                            <SelectItem value="a4-6">A4 Split 6 (6 photos)</SelectItem>
                                        </SelectContent>
                                    </Select></FormItem>
                                )} />
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {photoFields.map((item, index) => (
                                        <div key={item.id} className="border p-4 rounded-lg space-y-2">
                                            <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
                                                    {form.watch(`photos.${index}.dataUrl`) ? (
                                                    <Image src={form.watch(`photos.${index}.dataUrl`) as string} alt={`Photo ${index+1}`} width={300} height={200} className="object-cover w-full h-full rounded-md"/>
                                                    ) : (
                                                    <p className="text-muted-foreground text-sm">Photo {index+1}</p>
                                                    )}
                                            </div>
                                            <FormField control={form.control} name={`photos.${index}.dataUrl`} render={({ field }) => (
                                                <FormItem><FormLabel className="sr-only">Upload</FormLabel><FormControl>
                                                    <Input type="file" accept="image/*" onChange={(e) => { handlePhotoUpload(e, index); }}/>
                                                </FormControl></FormItem>
                                            )} />
                                                <FormField control={form.control} name={`photos.${index}.description`} render={({ field }) => (
                                                <FormItem><FormLabel className="sr-only">Description</FormLabel><FormControl><Textarea placeholder={`Description for photo ${index+1}...`} className="h-20" maxLength={200} {...field} /></FormControl></FormItem>
                                                )} />
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" onClick={() => appendPhoto({ dataUrl: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Another Photo</Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.push('/sa-reports/case-studies/view')}><Eye className="mr-2"/> View Reports</Button>
                            <Button type="button" variant="outline" onClick={() => form.reset()}><Delete className="mr-2"/> Clear</Button>
                            <Button type="submit">{editId ? 'Update Case Study' : 'Submit Case Study'}</Button>
                        </div>
                    </form>
                </Form>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

    