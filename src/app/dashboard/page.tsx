
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import {
  PlusCircle,
  Search,
  Users,
  CheckCircle,
  CalendarClock,
  UploadCloud,
  FileQuestion,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useAudits, AuditEntry, NIRNAY_STATUSES } from '@/services/audits';
import { MOCK_SCHEMES } from '@/services/schemes';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const auditFormSchema = z.object({
  scheme: z.string().min(1),
  roundNo: z.string().min(1, "Round No. is required"),
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  startDate: z.date({ required_error: "Start Date is required" }),
  endDate: z.date({ required_error: "End Date is required" }),
  sgsDate: z.date({ required_error: "SGS Date is required" }),
  auditVenue: z.string().min(1, "Audit Venue is required"),
  sgsVenue: z.string().min(1, "SGS Venue is required"),
  nirnayStatus: z.enum(NIRNAY_STATUSES, { required_error: "NIRNAY Status is required" }),
  comment: z.string().optional(),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

const SummaryCard = ({ title, value }: { title: string; value: string | number }) => (
    <Card className="shadow-md">
        <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const { audits, addAudit, updateAudit, deleteAudit, loading: auditsLoading } = useAudits();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAudit, setEditingAudit] = useState<AuditEntry | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        district: 'all',
        block: 'all',
        panchayat: 'all',
    });

    const form = useForm<AuditFormValues>({
        resolver: zodResolver(auditFormSchema),
        defaultValues: { scheme: 'MGNREGS', nirnayStatus: 'No' },
    });
    
    const watchedDistrict = form.watch("district");
    const watchedBlock = form.watch("block");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);
    
    useEffect(() => {
        if (watchedDistrict) form.setValue("block", "");
    }, [watchedDistrict, form]);
    
    useEffect(() => {
        if (watchedBlock) form.setValue("panchayat", "");
    }, [watchedBlock, form]);
    
    const selectedLgdCode = useMemo(() => {
        const panchayatLgd = form.watch("panchayat");
        if (!panchayatLgd) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === panchayatLgd);
        return panchayat ? panchayat.lgdCode : '';
    }, [form.watch("panchayat")]);


    const summaryStats = useMemo(() => {
        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });

        const completed = audits.filter(a => parseISO(a.sgsDate) < now).length;
        const auditingThisWeek = audits.filter(a => isWithinInterval(parseISO(a.startDate), { start: startOfThisWeek, end: endOfThisWeek })).length;
        const misUploaded = audits.filter(a => a.misStatus === 'Uploaded').length;
        const nirnayYes = audits.filter(a => a.nirnayStatus === 'Yes').length;

        return {
            planned: 12525,
            completed,
            auditingThisWeek,
            misUploaded,
            nirnayYes,
        }
    }, [audits]);

    const filteredAudits = useMemo(() => {
        return audits.filter(audit => {
            const searchLower = filters.search.toLowerCase();
            const searchMatch = !filters.search ? true : (
                audit.district.toLowerCase().includes(searchLower) ||
                audit.block.toLowerCase().includes(searchLower) ||
                audit.panchayatName.toLowerCase().includes(searchLower) ||
                audit.lgdCode.includes(searchLower)
            );
            const districtMatch = filters.district === 'all' || audit.district === filters.district;
            const blockMatch = filters.block === 'all' || audit.block === filters.block;
            const panchayatMatch = filters.panchayat === 'all' || audit.lgdCode === filters.panchayat;

            return searchMatch && districtMatch && blockMatch && panchayatMatch;
        });
    }, [audits, filters]);

    const handleAddNew = () => {
        setEditingAudit(null);
        form.reset({ scheme: 'MGNREGS', nirnayStatus: 'No' });
        setIsFormVisible(true);
    };
    
    const handleEdit = (audit: AuditEntry) => {
        setEditingAudit(audit);
        form.reset({
            ...audit,
            startDate: new Date(audit.startDate),
            endDate: new Date(audit.endDate),
            sgsDate: new Date(audit.sgsDate),
        });
        setIsFormVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteAudit(id);
        toast({ title: "Deleted!", description: "Audit entry has been removed." });
    };

    const onSubmit = (data: AuditFormValues) => {
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === data.panchayat);
        if (!panchayat) {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid Panchayat selected.' });
            return;
        }

        const auditData: Omit<AuditEntry, 'id'> = {
            ...data,
            lgdCode: panchayat.lgdCode,
            panchayatName: toTitleCase(panchayat.name),
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: format(data.endDate, 'yyyy-MM-dd'),
            sgsDate: format(data.sgsDate, 'yyyy-MM-dd'),
            misStatus: 'Not Uploaded', // Default value
        };
        
        if (editingAudit) {
            updateAudit({ ...auditData, id: editingAudit.id });
            toast({ title: "Updated!", description: "Audit entry has been successfully updated." });
        } else {
            addAudit(auditData);
            toast({ title: "Submitted!", description: "New audit entry has been created." });
        }

        form.reset({ scheme: 'MGNREGS', nirnayStatus: 'No' });
        setIsFormVisible(false);
        setEditingAudit(null);
    };
    
    const canManage = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);
    
    if (authLoading) return <p>Loading...</p>

    if (!user) {
        return (
             <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                 <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                    <p className="mt-4">You must be signed in to view this page.</p>
                     <Button asChild className="mt-6">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                   <SummaryCard title="Total Panchayats Planned" value={summaryStats.planned} />
                   <SummaryCard title="Completed Audits" value={summaryStats.completed} />
                   <SummaryCard title="Auditing This Week" value={summaryStats.auditingThisWeek} />
                   <SummaryCard title="Uploaded in MIS" value={summaryStats.misUploaded} />
                   <SummaryCard title="NIRNAY Status 'Yes'" value={summaryStats.nirnayYes} />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Auditing Panchayat Details</CardTitle>
                            <CardDescription>Manage and track the audit status of Panchayats.</CardDescription>
                        </div>
                        {canManage && (
                             <Button onClick={handleAddNew}><PlusCircle className="mr-2" /> Add New Entry</Button>
                        )}
                    </CardHeader>
                    <CardContent>
                         {isFormVisible && (
                             <Card className="mb-8 p-6">
                                 <CardTitle className="mb-4">{editingAudit ? 'Edit Audit Entry' : 'Add New Audit Entry'}</CardTitle>
                                 <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <Tabs defaultValue="MGNREGS" onValueChange={(val) => form.setValue('scheme', val)}>
                                            <TabsList>
                                                <TabsTrigger value="MGNREGS">MGNREGS</TabsTrigger>
                                                <TabsTrigger value="PMAY-G" disabled>PMAY-G</TabsTrigger>
                                                <TabsTrigger value="NMP" disabled>NMP</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                             <FormField control={form.control} name="roundNo" render={({ field }) => (
                                                 <FormItem>
                                                     <FormLabel>Round No.</FormLabel>
                                                     <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Round" /></SelectTrigger></FormControl>
                                                         <SelectContent>
                                                            {['Pilot 1', 'Pilot 2', ...Array.from({length: 35}, (_,i) => (i+1).toString())].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                         </SelectContent>
                                                     </Select>
                                                     <FormMessage />
                                                 </FormItem>
                                             )} />
                                            <FormField control={form.control} name="district" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>District</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                        <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="block" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Block</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                        <SelectContent>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="panchayat" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Panchayat</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                                        <SelectContent>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage />
                                                </FormItem>
                                            )} />
                                             <FormItem>
                                                <FormLabel>LGD Code</FormLabel>
                                                <FormControl><Input value={selectedLgdCode} readOnly className="bg-muted" /></FormControl>
                                            </FormItem>
                                            <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="sgsDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>SGS Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name="auditVenue" render={({ field }) => (<FormItem><FormLabel>Audit Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name="sgsVenue" render={({ field }) => (<FormItem><FormLabel>SGS Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name="nirnayStatus" render={({ field }) => (
                                                <FormItem><FormLabel>NIRNAY Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>{NIRNAY_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                                </Select><FormMessage /></FormItem>
                                             )} />
                                             <FormField control={form.control} name="comment" render={({ field }) => (<FormItem className="lg:col-span-4"><FormLabel>Comment</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <Button type="button" variant="outline" onClick={() => setIsFormVisible(false)}>Cancel</Button>
                                            <Button type="submit">{editingAudit ? 'Update' : 'Submit'}</Button>
                                        </div>
                                    </form>
                                 </Form>
                             </Card>
                         )}

                        <div className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Input placeholder="Search District, Block, Panchayat..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, district: 'all', block: 'all', panchayat: 'all' }))}/>
                               <Select value={filters.district} onValueChange={v => setFilters(f => ({ ...f, district: v, block: 'all', panchayat: 'all' }))}>
                                   <SelectTrigger><SelectValue /></SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                   </SelectContent>
                               </Select>
                           </div>
                           <div className="border rounded-lg">
                               <Table>
                                  <TableHeader>
                                     <TableRow>
                                          <TableHead>S.No</TableHead>
                                          <TableHead>District</TableHead>
                                          <TableHead>Block</TableHead>
                                          <TableHead>Panchayat</TableHead>
                                          <TableHead>LGD Code</TableHead>
                                          <TableHead>Start Date</TableHead>
                                          <TableHead>End Date</TableHead>
                                          <TableHead>SGS Date</TableHead>
                                          <TableHead>NIRNAY Status</TableHead>
                                          <TableHead>MIS Status</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                   <TableBody>
                                      {filteredAudits.map((audit, index) => (
                                          <TableRow key={audit.id}>
                                              <TableCell>{index + 1}</TableCell>
                                              <TableCell>{toTitleCase(audit.district)}</TableCell>
                                              <TableCell>{toTitleCase(audit.block)}</TableCell>
                                              <TableCell>{audit.panchayatName}</TableCell>
                                              <TableCell>{audit.lgdCode}</TableCell>
                                              <TableCell>{format(parseISO(audit.startDate), 'dd/MM/yyyy')}</TableCell>
                                              <TableCell>{format(parseISO(audit.endDate), 'dd/MM/yyyy')}</TableCell>
                                              <TableCell>{format(parseISO(audit.sgsDate), 'dd/MM/yyyy')}</TableCell>
                                              <TableCell>{audit.nirnayStatus}</TableCell>
                                              <TableCell>{audit.misStatus}</TableCell>
                                              <TableCell className="text-right space-x-2">
                                                  <Button variant="outline" size="sm" onClick={() => handleEdit(audit)}><Edit className="h-3 w-3" /></Button>
                                                  {canManage && (
                                                      <AlertDialog>
                                                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                              <AlertDialogHeader>
                                                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                  <AlertDialogDescription>This will permanently delete the audit entry for {audit.panchayatName}.</AlertDialogDescription>
                                                              </AlertDialogHeader>
                                                              <AlertDialogFooter>
                                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                  <AlertDialogAction onClick={() => handleDelete(audit.id)}>Delete</AlertDialogAction>
                                                              </AlertDialogFooter>
                                                          </AlertDialogContent>
                                                      </AlertDialog>
                                                  )}
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                   </TableBody>
                               </Table>
                           </div>
                        </div>
                    </CardContent>
                </Card>

            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

