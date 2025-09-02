
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Edit, Trash2, Printer, Search, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useMgnregs, MgnregsEntry, ParaParticulars } from '@/services/mgnregs-data';
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


type HighFmPara = MgnregsEntry & {
    paraDetails: ParaParticulars
}

const ReportViewer = ({ report }: { report: HighFmPara }) => {
    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === report.panchayat)?.name || '';

    return (
        <div className="bg-white text-black p-8 border rounded-md font-sans">
            <div className="text-center space-y-1 mb-4">
                <h1 className="text-xl font-bold">மகாத்மா காந்தி தேசிய ஊரக வேலை உறுதித் திட்டம் (MGNREGS)</h1>
                <h2 className="font-semibold">தீவிர முறைகேடுகள் குறித்த அறிக்கை</h2>
            </div>
             <section className="mb-4">
                <h3 className="text-lg font-bold text-primary">1. MGNREGS – ISSUE NO – {report.paraDetails.issueNumber}</h3>
            </section>
            <section className="mb-4">
                <h3 className="font-bold border-b pb-1 mb-2">BASIC INFORMATION:</h3>
                <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm">
                    <strong>DISTRICT:</strong><span>{report.district}</span>
                    <strong>BLOCK:</strong><span>{report.block}</span>
                    <strong>PANCHAYAT:</strong><span>{panchayatName}</span>
                    <strong>LGD CODE:</strong><span>{report.lgdCode}</span>
                    <strong>SGS DATE:</strong><span>{report.sgsDate ? new Date(report.sgsDate).toLocaleDateString() : ''}</span>
                    <strong>ROUND NO:</strong><span>{report.roundNo}</span>
                    <strong>BRP NAME:</strong><span>{report.brpName}</span>
                    <strong>EMPLOYEE CODE:</strong><span>{report.brpEmployeeCode}</span>
                    <strong>DRP / DRP I/C NAME:</strong><span>{report.drpName}</span>
                    <strong>EMPLOYEE CODE:</strong><span>{report.drpEmployeeCode}</span>
                </div>
            </section>
            <section className="mb-4">
                <h3 className="font-bold border-b pb-1 mb-2">PARA DETAILS:</h3>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <p><strong>Type:</strong> {report.paraDetails.type}</p>
                    <p><strong>Category:</strong> {report.paraDetails.category}</p>
                    <p className="col-span-2"><strong>Sub-Category:</strong> {report.paraDetails.subCategory}</p>
                    <p><strong>Amount:</strong> ₹{report.paraDetails.amount?.toLocaleString()}</p>
                    <p><strong>Issue Code:</strong> {report.paraDetails.codeNumber}</p>
                    <p><strong>PARA NUMBER:</strong> {report.paraDetails.paraNumber}</p>
                    <p><strong>PAGE NO:</strong> FROM: {report.paraDetails.pageFrom} TO: {report.paraDetails.pageTo}</p>
                 </div>
                 <div className="mt-2">
                     <p className="font-bold text-sm">PARA DESCRIPTION:</p>
                     <p className="text-sm whitespace-pre-wrap">{report.paraDetails.paraDescription}</p>
                 </div>
            </section>
             {/* Add other sections similarly */}
        </div>
    )
}


export default function ViewHighFmReportPage() {
    const { entries, loading, updateMgnregsEntry, deleteMgnregsEntry } = useMgnregs();
    const { user } = useAuth();
    const { users } = useUsers();
    const router = useRouter();
    const { toast } = useToast();
    const printRef = useRef(null);
    const [displayData, setDisplayData] = useState<HighFmPara[]>([]);
    
    const [openBRPPopover, setOpenBRPPopover] = useState(false);
    const [filterType, setFilterType] = useState('round');
    const [selectedRound, setSelectedRound] = useState<string>('all');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [selectedBRP, setSelectedBRP] = useState<string>('all');

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const highFmParas = useMemo(() => {
        return entries.flatMap(entry => 
            (entry.paraParticulars || [])
            .filter(para => para.isReportSubmitted && para.type === 'FM - Financial Misappropriation' && (para.amount || 0) >= 10000)
            .map(para => ({ ...entry, paraDetails: para }))
        );
    }, [entries]);

    const brpList = useMemo(() => {
        return users.filter(u => u.designation === 'BRP');
    }, [users]);
    
    const uniqueRounds = useMemo(() => {
        const rounds = new Set(entries.map(e => e.roundNo));
        return Array.from(rounds).sort((a,b) => parseInt(a, 10) - parseInt(b, 10));
    }, [entries]);
    
    const handleGetReports = () => {
        let data = [...highFmParas];
        
        if (filterType === 'round') {
            if (selectedRound !== 'all') {
                data = data.filter(item => item.roundNo === selectedRound);
            }
            // Sort by district then panchayat
            data.sort((a, b) => a.district.localeCompare(b.district) || a.panchayat.localeCompare(b.panchayat));
        }
        else if (filterType === 'brp') {
            if (selectedBRP !== 'all') {
                data = data.filter(item => item.brpEmployeeCode === selectedBRP);
            }
             data.sort((a, b) => (parseInt(a.roundNo, 10) || 0) - (parseInt(b.roundNo, 10) || 0));
        }
        else if (filterType === 'district') {
            if (selectedDistrict !== 'all') {
                 data = data.filter(item => item.district === selectedDistrict);
            }
            data.sort((a, b) => (parseInt(a.roundNo, 10) || 0) - (parseInt(b.roundNo, 10) || 0));
        }
        
        setDisplayData(data);
    };
    
     const handleDelete = (entryId: number, issueNo: string) => {
        const entryToUpdate = entries.find(e => e.id === entryId);
        if (!entryToUpdate) return;
        
        const updatedParas = entryToUpdate.paraParticulars?.map(p => {
            if (p.issueNumber === issueNo) {
                return { ...p, isReportSubmitted: false };
            }
            return p;
        });
        
        updateMgnregsEntry({ ...entryToUpdate, paraParticulars: updatedParas });
        toast({ title: "Report Deleted", description: "The report has been removed and the entry is marked as pending again." });
        // Refresh displayed data
        setDisplayData(prev => prev.filter(item => !(item.id === entryId && item.paraDetails.issueNumber === issueNo)));
    };

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>View High FM Para Reports</CardTitle>
                        <CardDescription>Filter and view submitted reports for high-value financial misappropriation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="round">Round Wise</SelectItem>
                                    <SelectItem value="brp">BRP Wise</SelectItem>
                                    <SelectItem value="district">District Wise</SelectItem>
                                </SelectContent>
                            </Select>

                             {filterType === 'round' && (
                                <Select value={selectedRound} onValueChange={setSelectedRound}>
                                    <SelectTrigger><SelectValue placeholder="Select Round"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Rounds</SelectItem>
                                        {uniqueRounds.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             )}
                             {filterType === 'district' && (
                                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                    <SelectTrigger><SelectValue placeholder="Select District"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             )}
                             {filterType === 'brp' && (
                                 <Popover open={openBRPPopover} onOpenChange={setOpenBRPPopover}>
                                     <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedBRP !== 'all' ? brpList.find(brp => brp.employeeCode === selectedBRP)?.name : "Select BRP..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                     <PopoverContent className="w-[300px] p-0">
                                         <Command>
                                            <CommandInput placeholder="Search BRP..."/>
                                             <CommandEmpty>No BRP found.</CommandEmpty>
                                             <CommandList>
                                                 <CommandItem onSelect={() => {setSelectedBRP('all'); setOpenBRPPopover(false);}}>All BRPs</CommandItem>
                                                 {brpList.map((brp) => (
                                                    <CommandItem
                                                        key={brp.id}
                                                        value={`${brp.name} ${brp.employeeCode}`}
                                                        onSelect={() => {
                                                            setSelectedBRP(brp.employeeCode);
                                                            setOpenBRPPopover(false);
                                                        }}
                                                    >
                                                         <Check className={cn("mr-2 h-4 w-4", selectedBRP === brp.employeeCode ? "opacity-100" : "opacity-0")} />
                                                         {brp.name} ({brp.employeeCode})
                                                    </CommandItem>
                                                 ))}
                                             </CommandList>
                                         </Command>
                                     </PopoverContent>
                                 </Popover>
                             )}
                             <div className="md:col-start-4 flex justify-end gap-2">
                                <Button onClick={handleGetReports}>Get Reports</Button>
                                <Button onClick={handlePrint} disabled={displayData.length === 0}><Printer className="mr-2"/> Print Reports</Button>
                             </div>
                        </div>
                        
                         <div ref={printRef} className="print-container">
                             <div className="space-y-4">
                                {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                                {!loading && displayData.length === 0 && <p className="text-center p-8 text-muted-foreground">No submitted reports match the selected criteria. Click "Get Reports" to view data.</p>}
                                {!loading && displayData.map(report => (
                                    <div key={`${report.id}-${report.paraDetails.issueNumber}`} className="report-item space-y-2 break-after-page">
                                        <ReportViewer report={report} />
                                        {canEdit && (
                                            <div className="flex justify-end gap-2 no-print">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/sa-reports/high-fm-para-details/edit?id=${report.id}&issueNo=${report.paraDetails.issueNumber}`)}>
                                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3"/> Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will delete the submitted report and mark the original entry as pending again. It will NOT delete the MGNREGS data entry itself.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(report.id, report.paraDetails.issueNumber)}>Confirm Delete</AlertDialogAction>
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
