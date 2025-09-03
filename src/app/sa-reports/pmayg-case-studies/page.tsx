
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Edit, Trash2, Printer, Search, Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useCaseStudies, CaseStudy } from '@/services/case-studies';
import { useUsers } from '@/services/users';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { uniqueDistricts } from '@/lib/utils';
import Image from 'next/image';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';

const ReportViewer = ({ report }: { report: CaseStudy }) => {
    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === report.panchayat)?.name || '';

    return (
        <div className="bg-white text-black p-8 border rounded-md font-sans">
            <style>{`
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              `}</style>
            <div className="text-center space-y-1 mb-4">
                <h1 className="text-xl font-bold">Case Study Report</h1>
                <h2 className="font-semibold">Scheme: {report.scheme}</h2>
            </div>
             <section className="mb-4">
                <h3 className="text-lg font-bold text-primary">Case Study No: {report.caseStudyNo}</h3>
            </section>
             <section className="mb-4">
                <h3 className="font-bold border-b pb-1 mb-2">Basic Information:</h3>
                <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm">
                    <strong>District:</strong><span>{report.district}</span>
                    <strong>Block:</strong><span>{report.block}</span>
                    <strong>Panchayat:</strong><span>{panchayatName}</span>
                    <strong>SGS Date:</strong><span>{report.sgsDate || 'N/A'}</span>
                    <strong>Round No:</strong><span>{report.roundNo || 'N/A'}</span>
                    <strong>BRP Name:</strong><span>{report.brpName || 'N/A'}</span>
                </div>
            </section>
            <section className="mb-4">
                <h3 className="font-bold border-b pb-1 mb-2">Issue Details:</h3>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <p><strong>Para Number:</strong> {report.paraNo}</p>
                    <p><strong>Issue Number:</strong> {report.issueNo}</p>
                    <p className="col-span-2"><strong>Issue Type:</strong> {report.issueType}</p>
                    <p className="col-span-2"><strong>Category:</strong> {report.issueCategory}</p>
                    <p className="col-span-2"><strong>Sub-Category:</strong> {report.subCategory}</p>
                 </div>
            </section>
             <section className="mb-4">
                <h3 className="font-bold border-b pb-1 mb-2">Description:</h3>
                <p className="text-sm whitespace-pre-wrap">{report.description}</p>
             </section>
              {report.tableData && report.tableData.length > 0 && (
                 <section className="mb-4">
                    <h3 className="font-bold border-b pb-1 mb-2">Data Table:</h3>
                     <div className="border rounded-lg overflow-x-auto">
                        <table className="w-full text-sm table-auto border-collapse border border-black">
                            <tbody>
                                {report.tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex} className="font-normal border border-black p-2 text-center whitespace-normal break-words">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                 </section>
            )}

            {report.photoPages && report.photoPages.length > 0 && report.photoPages.map((page, pageIndex) => (
                 <section key={pageIndex} className="mb-4 break-after-page">
                    <h3 className="font-bold border-b pb-1 mb-2">Photos - Page {pageIndex + 1}</h3>
                    <div className={cn(
                        "grid gap-4",
                        page.layout === 'a4-1' && "grid-cols-1",
                        page.layout === 'a4-2' && "grid-cols-1 md:grid-cols-2",
                        page.layout === 'a4-4' && "grid-cols-2",
                        page.layout === 'a4-6' && "grid-cols-3",
                    )}>
                        {page.photos?.map((photo, index) => (
                           <div key={index} className="space-y-2">
                               <div className="border rounded-lg overflow-hidden">
                                 <Image src={photo.dataUrl} alt={photo.description || `Photo ${index + 1}`} width={600} height={400} className="w-full h-auto object-contain" />
                               </div>
                               <p className="text-sm text-center">{photo.description}</p>
                           </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}

export default function PmaygCaseStudiesPage() {
    const { caseStudies, loading, deleteCaseStudy } = useCaseStudies();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const printRef = useRef(null);

    const pmaygCaseStudies = useMemo(() => {
        return caseStudies.filter(cs => cs.scheme === 'PMAY-G');
    }, [caseStudies]);
    
    const [displayData, setDisplayData] = useState<CaseStudy[]>([]);
    
    const [openBRPPopover, setOpenBRPPopover] = useState(false);
    const [openCSNoPopover, setOpenCSNoPopover] = useState(false);
    
    const [filters, setFilters] = useState({
        district: 'all',
        brpEmployeeCode: 'all',
        caseStudyNo: 'all',
    });

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const uniqueBRPs = useMemo(() => {
        const brps = new Map<string, {name: string, code: string}>();
        pmaygCaseStudies.forEach(cs => {
            if(cs.employeeCode && cs.brpName) {
                brps.set(cs.employeeCode, {name: cs.brpName, code: cs.employeeCode});
            }
        });
        return Array.from(brps.values());
    }, [pmaygCaseStudies]);

     const uniqueCaseStudyNos = useMemo(() => {
        return Array.from(new Set(pmaygCaseStudies.map(cs => cs.caseStudyNo)));
    }, [pmaygCaseStudies]);
    
    const handleGetReports = () => {
        let data = [...pmaygCaseStudies];
        
        if (filters.district !== 'all') {
            data = data.filter(item => item.district === filters.district);
        }
        if (filters.brpEmployeeCode !== 'all') {
            data = data.filter(item => item.employeeCode === filters.brpEmployeeCode);
        }
         if (filters.caseStudyNo !== 'all') {
            data = data.filter(item => item.caseStudyNo === filters.caseStudyNo);
        }
        
        setDisplayData(data);
    };
    
    const handleDelete = (id: number) => {
        deleteCaseStudy(id);
        toast({ title: "Case Study Deleted", description: "The case study report has been removed." });
        setDisplayData(prev => prev.filter(item => item.id !== id));
    };

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>PMAY-G Case Study Reports</CardTitle>
                        <CardDescription>Filter and view submitted case studies for the PMAY-G scheme.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 items-end">
                             <Select value={filters.district} onValueChange={(v) => setFilters(f => ({...f, district: v}))}>
                                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Popover open={openBRPPopover} onOpenChange={setOpenBRPPopover}>
                                 <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {filters.brpEmployeeCode !== 'all' ? uniqueBRPs.find(brp => brp.code === filters.brpEmployeeCode)?.name : "Select BRP..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                 <PopoverContent className="w-[300px] p-0">
                                     <Command><CommandInput placeholder="Search BRP..."/><CommandEmpty>No BRP found.</CommandEmpty>
                                         <CommandList>
                                             <CommandItem onSelect={() => {setFilters(f => ({...f, brpEmployeeCode: 'all'})); setOpenBRPPopover(false);}}>All BRPs</CommandItem>
                                             {uniqueBRPs.map((brp) => (
                                                <CommandItem key={brp.code} value={brp.name} onSelect={() => {setFilters(f => ({...f, brpEmployeeCode: brp.code})); setOpenBRPPopover(false);}}>
                                                     <Check className={cn("mr-2 h-4 w-4", filters.brpEmployeeCode === brp.code ? "opacity-100" : "opacity-0")} />{brp.name} ({brp.code})
                                                </CommandItem>
                                             ))}
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>
                              <Popover open={openCSNoPopover} onOpenChange={setOpenCSNoPopover}>
                                 <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {filters.caseStudyNo !== 'all' ? filters.caseStudyNo : "Select Case Study No..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                 <PopoverContent className="w-[300px] p-0">
                                     <Command><CommandInput placeholder="Search Case Study No..."/><CommandEmpty>No Case Study found.</CommandEmpty>
                                         <CommandList>
                                             <CommandItem onSelect={() => {setFilters(f => ({...f, caseStudyNo: 'all'})); setOpenCSNoPopover(false);}}>All Case Studies</CommandItem>
                                             {uniqueCaseStudyNos.map((csNo) => (
                                                <CommandItem key={csNo} value={csNo} onSelect={() => {setFilters(f => ({...f, caseStudyNo: csNo})); setOpenCSNoPopover(false);}}>
                                                     <Check className={cn("mr-2 h-4 w-4", filters.caseStudyNo === csNo ? "opacity-100" : "opacity-0")} />{csNo}
                                                </CommandItem>
                                             ))}
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>

                             <div className="md:col-start-4 lg:col-start-5 flex justify-end gap-2">
                                <Button onClick={handleGetReports}>Get Reports</Button>
                                <Button onClick={handlePrint} disabled={displayData.length === 0}><Printer className="mr-2"/> Print</Button>
                             </div>
                        </div>
                        
                         <div ref={printRef} className="print-container">
                             <div className="space-y-4">
                                {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                                {!loading && displayData.length === 0 && <p className="text-center p-8 text-muted-foreground">No submitted reports match the selected criteria. Click "Get Reports" to view data.</p>}
                                {!loading && displayData.map(report => (
                                    <div key={report.id} className="report-item space-y-2 break-after-page">
                                        <ReportViewer report={report} />
                                        {canEdit && (
                                            <div className="flex justify-end gap-2 no-print">
                                                 <Button variant="outline" size="sm" onClick={() => router.push(`/sa-reports/case-studies/add?edit=${report.caseStudyNo}`)}>
                                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3"/> Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete this case study.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(report.id)}>Confirm Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                ))}
                             </div>
                         </div>
                    </CardContent>
                 </Card>
            </main>
             <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none;
                    }
                    .report-item {
                        page-break-after: always;
                    }
                }
            `}</style>
            <Footer />
            <BottomNavigation />
        </div>
    )
}
