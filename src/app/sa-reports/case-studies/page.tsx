
'use client';

import React, { useState, useMemo, useEffect, FC } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MOCK_SCHEMES } from '@/services/schemes';
import { useUsers, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useCaseStudies } from '@/services/case-studies';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
import { uniqueDistricts } from '@/lib/utils';

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
  descriptionEnglish: z.string().optional(),
  descriptionTamil: z.string().optional(),
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

    const [caseStudyNo, setCaseStudyNo] = useState('');
    const [tableStructure, setTableStructure] = useState<{ rows: number, cols: number} | null>(null);

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const form = useForm<CaseStudyFormValues>({
        resolver: zodResolver(caseStudySchema),
        defaultValues: {
            caseStudyNo: '',
            scheme: MOCK_SCHEMES[0].name,
            photos: [],
            tableData: [],
        },
    });
    
    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control: form.control, name: 'photos' });

    const watchedScheme = form.watch("scheme");
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");
    const watchedPanchayat = form.watch("panchayat");
    const watchedEmployeeCode = form.watch("employeeCode");
    const watchedIssueType = form.watch("issueType");
    const watchedIssueCategory = form.watch("issueCategory");
    const watchedTableRows = form.watch("tableRows");
    const watchedTableCols = form.watch("tableCols");
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
            setCaseStudyNo(getNextCaseStudyNumber(watchedDistrict));
            form.setValue('caseStudyNo', getNextCaseStudyNumber(watchedDistrict));
        } else {
             setCaseStudyNo('');
             form.setValue('caseStudyNo', '');
        }
    }, [watchedDistrict, getNextCaseStudyNumber, form]);
    
    const issueTypes = useMemo(() => Array.from(new Set(MOCK_MGNREGS_DATA.map(d => d.type))), []);
    const issueCategories = useMemo(() => {
        if (!watchedIssueType) return [];
        return Array.from(new Set(MOCK_MGNREGS_DATA.filter(d => d.type === watchedIssueType).map(d => d.category)));
    }, [watchedIssueType]);
    const subCategories = useMemo(() => {
        if (!watchedIssueCategory) return [];
        return MOCK_MGNREGS_DATA.filter(d => d.type === watchedIssueType && d.category === watchedIssueCategory);
    }, [watchedIssueCategory, watchedIssueType]);
    
     useEffect(() => {
        const subCategory = form.watch('subCategory');
        const code = subCategories.find(s => s.subCategory === subCategory)?.codeNumber || '';
        form.setValue('issueCode', code);
    }, [form.watch('subCategory'), subCategories, form]);


    const handleTableGeneration = () => {
        const rows = watchedTableRows || 0;
        const cols = watchedTableCols || 0;
        if (rows > 0 && cols > 0) {
            setTableStructure({ rows, cols });
            form.setValue('tableData', Array(rows).fill(Array(cols).fill('')));
        }
    };
    
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({ variant: 'destructive', title: "File too large", description: "Photo must be 5MB or smaller." });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const currentPhotos = form.getValues('photos') || [];
            currentPhotos[index].dataUrl = reader.result as string;
            form.setValue('photos', currentPhotos);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = (data: CaseStudyFormValues) => {
        addCaseStudy(data);
        toast({ title: "Success!", description: `Case Study ${data.caseStudyNo} has been saved.` });
        form.reset();
        setTableStructure(null);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs defaultValue={MOCK_SCHEMES[0].id} onValueChange={(val) => form.setValue('scheme', val)}>
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
                                         
                                         <FormField control={form.control} name="issueType" render={({ field }) => (<FormItem><FormLabel>Issue Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Issue Type" /></SelectTrigger></FormControl><SelectContent>{issueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                         <FormField control={form.control} name="issueCategory" render={({ field }) => (<FormItem><FormLabel>Issue Category</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!watchedIssueType}><FormControl><SelectTrigger><SelectValue placeholder="Select Issue Category" /></SelectTrigger></FormControl><SelectContent>{issueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                          <FormField control={form.control} name="subCategory" render={({ field }) => (
                                            <FormItem className="lg:col-span-2"><FormLabel>Sub Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedIssueCategory}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Sub Category" /></SelectTrigger></FormControl>
                                                <SelectContent>{subCategories.map(sc => <SelectItem key={sc.codeNumber} value={sc.subCategory}>{sc.subCategory}</SelectItem>)}</SelectContent>
                                            </Select></FormItem>
                                          )} />
                                         <FormField control={form.control} name="issueCode" render={({ field }) => (<FormItem><FormLabel>Issue Code</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl></FormItem>)} />
                                         <FormField control={form.control} name="beneficiaries" render={({ field }) => (<FormItem><FormLabel>No. of Beneficiaries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                     </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Section 4: Description</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="descriptionEnglish" render={({ field }) => (
                                            <FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea className="h-40" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="descriptionTamil" render={({ field }) => (
                                            <FormItem><FormLabel>Description (Tamil)</FormLabel>
                                                <div className="relative"><FormControl><Textarea className="h-40 pr-10" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 text-muted-foreground"><Mic className="h-4 w-4"/></Button></div>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Section 5: Table Auto-Generator</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-4 items-end">
                                            <FormField control={form.control} name="tableRows" render={({ field }) => (<FormItem><FormLabel>No. of Rows</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="tableCols" render={({ field }) => (<FormItem><FormLabel>No. of Columns</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                                            <Button type="button" onClick={handleTableGeneration}>Generate Table</Button>
                                        </div>
                                         {tableStructure && (
                                            <div className="overflow-x-auto border rounded-lg p-2">
                                                 <table className="w-full">
                                                    <tbody>
                                                        {Array.from({ length: tableStructure.rows }).map((_, rowIndex) => (
                                                            <tr key={rowIndex}>
                                                                {Array.from({ length: tableStructure.cols }).map((_, colIndex) => (
                                                                    <td key={colIndex} className="p-1">
                                                                        <FormField control={form.control} name={`tableData.${rowIndex}.${colIndex}`} render={({ field }) => (
                                                                            <Input {...field} className={cn("text-sm", colIndex > 0 ? "text-right" : "text-left")} />
                                                                        )} />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                 </table>
                                            </div>
                                         )}
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader><CardTitle>Section 6: Photo Upload</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="photoLayout" render={({ field }) => (
                                            <FormItem><FormLabel>Photo Layout</FormLabel>
                                            <Select onValueChange={(val) => {
                                                field.onChange(val);
                                                const count = parseInt(val.split('-')[1] || '0', 10);
                                                removePhoto(); // Clear existing
                                                for(let i=0; i<count; i++) appendPhoto({ dataUrl: '', description: '' });
                                            }} value={field.value}>
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
                                                            <Image src={form.watch(`photos.${index}.dataUrl`)} alt={`Photo ${index+1}`} width={300} height={200} className="object-cover w-full h-full rounded-md"/>
                                                         ) : (
                                                            <p className="text-muted-foreground text-sm">Photo {index+1}</p>
                                                         )}
                                                    </div>
                                                    <FormField control={form.control} name={`photos.${index}.dataUrl`} render={({ field }) => (
                                                        <FormItem><FormLabel className="sr-only">Upload</FormLabel><FormControl>
                                                            <Input type="file" accept="image/*" onChange={(e) => {
                                                                handlePhotoUpload(e, index);
                                                                field.onChange(e.target.files?.[0])
                                                            }}/>
                                                        </FormControl></FormItem>
                                                    )} />
                                                     <FormField control={form.control} name={`photos.${index}.description`} render={({ field }) => (
                                                        <FormItem><FormLabel className="sr-only">Description</FormLabel><FormControl><Textarea placeholder={`Description for photo ${index+1}...`} className="h-20" maxLength={200} /></FormControl></FormItem>
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

