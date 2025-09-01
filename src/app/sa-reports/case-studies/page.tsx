
'use client';

import React, { useState, useMemo, useEffect, FC } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MOCK_SCHEMES } from '@/services/schemes';
import { useUsers, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { usePmaygIssues, PmaygIssue } from '@/services/pmayg-issues';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';

import { uniqueDistricts } from '@/lib/utils';
import { useCaseStudies } from '@/services/case-studies';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

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
import { PlusCircle, Trash2, Mic, Upload, Eye, Edit, Delete } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const caseStudySchema = z.object({
  caseStudyNo: z.string(),
  scheme: z.string().min(1),
  district: z.string().min(1),
  block: z.string().min(1),
  panchayat: z.string().min(1),
  lgdCode: z.string(),
  employeeCode: z.string().min(1),
  brpName: z.string(),
  paraNo: z.string().optional(),
  issueNo: z.string().optional(),
  issueType: z.string().optional(),
  issueCategory: z.string().optional(),
  subCategory: z.string().optional(),
  issueCode: z.string().optional(),
  beneficiaries: z.coerce.number().optional(),
  description: z.string().optional(),
  
  // MGNREGS amount
  amount: z.coerce.number().optional(),

  // PMAY-G amounts
  centralAmount: z.coerce.number().optional(),
  stateAmount: z.coerce.number().optional(),
  otherAmount: z.coerce.number().optional(),
  
  pastedTableData: z.string().optional(),
  tableRows: z.coerce.number().min(0).optional(),
  tableCols: z.coerce.number().min(0).optional(),
  tableData: z.array(z.array(z.string())).optional(),
  photoLayout: z.string().optional(),
  photos: z.array(z.object({
    dataUrl: z.string(),
    description: z.string().max(200),
  })).optional(),
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function CaseStudiesPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const { users } = useUsers();
    const { getNextCaseStudyNumber, addCaseStudy } = useCaseStudies();
    const { issues: pmaygIssues, addIssue: savePmaygIssue } = usePmaygIssues();


    const [caseStudyNo, setCaseStudyNo] = useState('');

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const form = useForm<CaseStudyFormValues>({
        resolver: zodResolver(caseStudySchema),
        defaultValues: {
            caseStudyNo: '', scheme: MOCK_SCHEMES[0].name, district: '', block: '', panchayat: '', lgdCode: '',
            employeeCode: '', brpName: '', paraNo: '', issueNo: '', issueType: '', issueCategory: '', subCategory: '', issueCode: '',
            beneficiaries: 0, description: '', amount: 0, centralAmount: 0, stateAmount: 0, otherAmount: 0,
            tableRows: 0, tableCols: 0, tableData: [], pastedTableData: '', photoLayout: '', photos: [],
        },
    });
    
    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control: form.control, name: 'photos' });

    const watchedScheme = form.watch("scheme");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedEmployeeCode = form.watch("employeeCode");
    const watchedIssueNo = form.watch("issueNo");
    const watchedTableData = form.watch("tableData");
    const watchedPhotoLayout = form.watch("photoLayout");

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
        if (watchedEmployeeCode) {
            const brp = users.find(u => u.employeeCode === watchedEmployeeCode);
            form.setValue('brpName', brp?.name || '');
        }
    }, [watchedEmployeeCode, users, form]);
    
    useEffect(() => {
        if (watchedDistrict) {
            const newCaseStudyNo = getNextCaseStudyNumber(watchedDistrict);
            setCaseStudyNo(newCaseStudyNo);
            form.setValue('caseStudyNo', newCaseStudyNo);
        } else {
             setCaseStudyNo('');
             form.setValue('caseStudyNo', '');
        }
    }, [watchedDistrict, getNextCaseStudyNumber, form]);
    
    useEffect(() => {
      let issueData: any;
      if (watchedScheme === 'MGNREGS') {
        issueData = MOCK_MGNREGS_DATA.find(d => d.codeNumber === watchedIssueNo);
      } else if (watchedScheme === 'PMAY-G') {
        issueData = pmaygIssues.find(i => i.issueNumber === watchedIssueNo);
      }

      if (issueData) {
        form.setValue('issueType', issueData.type);
        form.setValue('issueCategory', issueData.category);
        form.setValue('subCategory', issueData.subCategory);
        form.setValue('issueCode', issueData.codeNumber);
        if(watchedScheme === 'MGNREGS') form.setValue('amount', issueData.amount || 0);
        if(watchedScheme === 'PMAY-G') {
            form.setValue('centralAmount', issueData.centralAmount || 0);
            form.setValue('stateAmount', issueData.stateAmount || 0);
            form.setValue('otherAmount', issueData.otherAmount || 0);
        }

      } else {
        form.setValue('issueType', '');
        form.setValue('issueCategory', '');
        form.setValue('subCategory', '');
        form.setValue('issueCode', '');
      }

    }, [watchedIssueNo, watchedScheme, pmaygIssues, form]);

    const handleParseTable = () => {
        const textData = form.getValues('pastedTableData') || '';
        const rows = textData.split('\n').filter(row => row.trim() !== '');
        if (rows.length === 0) {
            form.setValue('tableData', []);
            form.setValue('tableRows', 0);
            form.setValue('tableCols', 0);
            return;
        }
        const parsedData = rows.map(row => row.split('\t'));
        form.setValue('tableData', parsedData);
        form.setValue('tableRows', parsedData.length);
        form.setValue('tableCols', parsedData[0]?.length || 0);
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
    
    useEffect(() => {
        const count = parseInt(watchedPhotoLayout?.split('-')[1] || '0', 10);
        const currentCount = photoFields.length;
        if(count > currentCount) {
            for(let i = currentCount; i < count; i++) {
                appendPhoto({ dataUrl: '', description: '' });
            }
        } else if (count < currentCount) {
            for(let i = currentCount - 1; i >= count; i--) {
                removePhoto(i);
            }
        }
    }, [watchedPhotoLayout, appendPhoto, removePhoto, photoFields.length]);


    const onSubmit = (data: CaseStudyFormValues) => {
        addCaseStudy(data);
        toast({ title: "Success!", description: `Case Study ${data.caseStudyNo} has been saved.` });
        form.reset();
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs defaultValue={MOCK_SCHEMES[0].name} onValueChange={(val) => form.setValue('scheme', val)}>
                            <TabsList>
                               {MOCK_SCHEMES.map(s => <TabsTrigger key={s.id} value={s.name}>{s.name}</TabsTrigger>)}
                            </TabsList>
                             <TabsContent value="MGNREGS" className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Section 1: Basic Case Info</CardTitle></CardHeader>
                                    <CardContent><FormField control={form.control} name="caseStudyNo" render={({ field }) => (
                                        <FormItem><FormLabel>Case Study No</FormLabel><FormControl><Input {...field} readOnly className="bg-muted w-1/3" /></FormControl></FormItem>
                                     )} /></CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Section 2: Location</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl><SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl><SelectContent>{blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="panchayat" render={({ field }) => (<FormItem><FormLabel>Panchayat</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedBlock}><FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl><SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="lgdCode" render={({ field }) => (<FormItem><FormLabel>LGD Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>)} />
                                    </CardContent>
                                </Card>

                                <Card>
                                     <CardHeader><CardTitle>Section 3: Issue Details</CardTitle></CardHeader>
                                     <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                         <FormField control={form.control} name="employeeCode" render={({ field }) => (<FormItem><FormLabel>Employee Code</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Code" /></SelectTrigger></FormControl><SelectContent>{users.map(u => <SelectItem key={u.id} value={u.employeeCode}>{u.employeeCode}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="brpName" render={({ field }) => (<FormItem><FormLabel>BRP Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="paraNo" render={({ field }) => (<FormItem><FormLabel>Para No.</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="issueNo" render={({ field }) => (<FormItem><FormLabel>Issue No.</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                         
                                         <FormField control={form.control} name="issueType" render={({ field }) => (<FormItem><FormLabel>Issue Type</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="issueCategory" render={({ field }) => (<FormItem><FormLabel>Issue Category</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem className="lg:col-span-2"><FormLabel>Sub Category</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="issueCode" render={({ field }) => (<FormItem><FormLabel>Issue Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="beneficiaries" render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                         {watchedScheme === 'MGNREGS' && <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />}
                                        {watchedScheme === 'PMAY-G' && (
                                            <>
                                                <FormField control={form.control} name="centralAmount" render={({ field }) => (<FormItem><FormLabel>Central Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="stateAmount" render={({ field }) => (<FormItem><FormLabel>State Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="otherAmount" render={({ field }) => (<FormItem><FormLabel>Others Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            </>
                                        )}
                                     </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Section 4: Description</CardTitle></CardHeader>
                                    <CardContent>
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem><FormLabel>Description (Supports Tamil and English)</FormLabel>
                                                <div className="relative"><FormControl><Textarea className="h-40 pr-10" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground"><Mic className="h-4 w-4"/></Button></div>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Section 5: Data Table</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">Paste your table data from Excel or Word into the text area below. Data should be separated by tabs for columns and new lines for rows.</p>
                                        <FormField control={form.control} name="pastedTableData" render={({ field }) => (
                                            <FormItem><FormLabel>Paste Table Data Here</FormLabel><FormControl><Textarea className="h-40 font-mono" {...field} /></FormControl></FormItem>
                                        )} />
                                        <Button type="button" onClick={handleParseTable}>Parse Table from Text</Button>

                                         {watchedTableData && watchedTableData.length > 0 && (
                                            <div className="space-y-2 pt-4">
                                                <h4 className="font-semibold">Parsed Table Preview:</h4>
                                                <div className="border rounded-lg overflow-x-auto">
                                                    <Table>
                                                        <TableBody>
                                                            {watchedTableData.map((row, rowIndex) => (
                                                                <TableRow key={rowIndex}>
                                                                    {row.map((cell, colIndex) => (
                                                                        <TableCell key={colIndex} className="font-normal border p-2 whitespace-nowrap">{cell}</TableCell>
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
                                    <CardHeader><CardTitle>Section 6: Photo Upload</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="photoLayout" render={({ field }) => (
                                            <FormItem><FormLabel>Photo Layout</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="w-1/3"><SelectValue placeholder="Select layout" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="a4-1">A4 Full (1 photo)</SelectItem>
                                                    <SelectItem value="a4-2">A4 Split 2 (2 photos)</SelectItem>
                                                    <SelectItem value="a4-4">A4 Split 4 (4 photos)</SelectItem>
                                                    <SelectItem value="a4-6">A4 Split 6 (6 photos)</SelectItem>
                                                </SelectContent>
                                            </Select></FormItem>
                                        )} />
                                         <div className={cn(
                                            "grid gap-4",
                                            watchedPhotoLayout === 'a4-1' && "grid-cols-1",
                                            watchedPhotoLayout === 'a4-2' && "grid-cols-1 md:grid-cols-2",
                                            watchedPhotoLayout === 'a4-4' && "grid-cols-1 md:grid-cols-2",
                                            watchedPhotoLayout === 'a4-6' && "grid-cols-1 md:grid-cols-3",
                                         )}>
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
                                                            <Input type="file" accept="image/*" onChange={(e) => {
                                                                handlePhotoUpload(e, index);
                                                                field.onChange(e.target.files?.[0]?.name);
                                                            }}/>
                                                        </FormControl></FormItem>
                                                    )} />
                                                     <FormField control={form.control} name={`photos.${index}.description`} render={({ field }) => (
                                                        <FormItem><FormLabel className="sr-only">Description</FormLabel><FormControl><Textarea placeholder={`Description for photo ${index+1}...`} className="h-20" maxLength={200} {...field} /></FormControl></FormItem>
                                                     )} />
                                                </div>
                                            ))}
                                         </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline"><Eye className="mr-2"/> View</Button>
                                    <Button type="button" variant="outline" onClick={() => form.reset()}><Delete className="mr-2"/> Clear</Button>
                                    <Button type="submit">Submit Case Study</Button>
                                </div>
                             </TabsContent>
                             {/* Other schemes will be built out here */}
                        </Tabs>
                    </form>
                </Form>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
