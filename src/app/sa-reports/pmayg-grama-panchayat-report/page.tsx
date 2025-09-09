
'use client';

import React, { useState, useMemo, FC, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format, parseISO } from 'date-fns';

import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { usePmayg, PmaygEntry } from '@/services/pmayg-data';
import { usePmaygIssues } from '@/services/pmayg-issues';
import { DISTRICTS } from '@/services/district-offices';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SectionCard: FC<{title: string, children: React.ReactNode, id: string}> = ({ title, children, id }) => (
    <div id={id} className="report-section mb-6 break-inside-avoid">
        <h3 className="text-lg font-bold bg-primary/10 text-primary p-2 rounded-t-md">{title}</h3>
        <div className="p-4 border border-t-0 rounded-b-md space-y-4">
            {children}
        </div>
    </div>
);

const InfoRow: FC<{label: string, value: React.ReactNode | undefined | null}> = ({ label, value }) => (
    <div className="text-sm">
        <span className="font-semibold text-foreground/80">{label}:</span>
        <span className="ml-2 font-normal text-foreground">{value || 'N/A'}</span>
    </div>
);

const PmaygReportViewer = ({ entry }: { entry: PmaygEntry }) => {
    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat)?.name || '';
     const { issues: pmaygIssues } = usePmaygIssues();

     const filteredIssues = useMemo(() => {
        return pmaygIssues.filter(issue => issue.panchayat === entry.panchayat);
     }, [pmaygIssues, entry.panchayat]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-md print-content font-sans text-black">
             <style>{`
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              `}</style>
            <h2 className="text-center text-xl font-bold mb-4">R.6.2.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT (PMAY-G)</h2>

            <SectionCard title="Section A: BRP Details" id="brp-details-pmayg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoRow label="BRP Name" value={entry.brpName} />
                    <InfoRow label="Employee Code" value={entry.brpEmployeeCode} />
                    <InfoRow label="District" value={entry.brpDistrict} />
                    <InfoRow label="Block" value={entry.brpBlock} />
                </div>
            </SectionCard>
            
            <SectionCard title="Section B: Basic Details" id="basic-details-pmayg">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoRow label="District" value={entry.district} />
                    <InfoRow label="Block" value={entry.block} />
                    <InfoRow label="Panchayat" value={panchayatName} />
                    <InfoRow label="LGD Code" value={entry.lgdCode} />
                    <InfoRow label="Round No" value={entry.roundNo} />
                    <InfoRow label="Audit Start Date" value={entry.auditStartDate ? format(new Date(entry.auditStartDate), 'dd/MM/yyyy') : 'N/A'} />
                    <InfoRow label="Audit End Date" value={entry.auditEndDate ? format(new Date(entry.auditEndDate), 'dd/MM/yyyy') : 'N/A'} />
                    <InfoRow label="SGS Date" value={entry.sgsDate ? format(new Date(entry.sgsDate), 'dd/MM/yyyy') : 'N/A'} />
                 </div>
            </SectionCard>

            <SectionCard title="Section C: Verification Details" id="verification-details-pmayg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoRow label="Total Houses" value={entry.totalHouses} />
                    <InfoRow label="1st Installments" value={entry.firstInstallment} />
                    <InfoRow label="2nd Installments" value={entry.secondInstallment} />
                    <InfoRow label="3rd Installments" value={entry.thirdInstallment} />
                    <InfoRow label="4th Installments" value={entry.fourthInstallment} />
                    <InfoRow label="Not Completed After 4th" value={entry.notCompletedAfterFourth} />
                </div>
            </SectionCard>

            <SectionCard title="Section G: Para Particulars" id="para-particulars-pmayg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Issue No.</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Sub-Category</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entry.paraParticulars?.map((issue, index) => (
                             <TableRow key={index}>
                                <TableCell>{issue.issueNumber}</TableCell>
                                <TableCell>{issue.type}</TableCell>
                                <TableCell>{issue.subCategory}</TableCell>
                                <TableCell>{issue.paraStatus}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </SectionCard>
        </div>
    );
};


export default function PmaygGramaPanchayatSocialAuditReport() {
    const { entries: pmaygEntries, loading: pmaygLoading } = usePmayg();
    const { panchayats } = usePanchayats();
    const printRef = useRef(null);

    const [filters, setFilters] = useState({
        district: 'all',
        block: 'all',
        panchayat: 'all',
        sgsDate: 'all'
    });
    
    const [selectedReport, setSelectedReport] = useState<PmaygEntry | null>(null);

    const uniqueDistricts = useMemo(() => Array.from(new Set(panchayats.map(p => p.district))).sort(), [panchayats]);

    const blocksForDistrict = useMemo(() => {
        if (filters.district === 'all') return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === filters.district).map(p => p.block))).sort();
    }, [filters.district]);

    const panchayatsForBlock = useMemo(() => {
        if (filters.block === 'all') return [];
        return MOCK_PANCHAYATS.filter(p => p.block === filters.block).sort((a,b) => a.name.localeCompare(b.name));
    }, [filters.block]);

    const sgsDatesForPanchayat = useMemo(() => {
        if (filters.panchayat === 'all') return [];
        return pmaygEntries.filter((e) => e.panchayat === filters.panchayat).map((e) => e.sgsDate);
    }, [filters.panchayat, pmaygEntries]);

    const handleGetReport = () => {
        const entry = pmaygEntries.find((e) => 
            e.panchayat === filters.panchayat && 
            e.sgsDate.toString() === filters.sgsDate
        );
        setSelectedReport(entry || null);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `PMAY-G_Social_Audit_Report_${selectedReport?.district}`
    });
    
    const loading = pmaygLoading;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                               <CardTitle>R.6.2.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT (PMAY-G)</CardTitle>
                                <CardDescription>Select filters to view a specific report.</CardDescription>
                            </div>
                             <Button onClick={handlePrint} disabled={!selectedReport}>
                                <Printer className="mr-2" /> Print Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end my-6">
                            <div className="space-y-2">
                                <label>District</label>
                                <Select value={filters.district} onValueChange={v => setFilters(f => ({ ...f, district: v, block: 'all', panchayat: 'all', sgsDate: 'all' }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label>Block</label>
                                <Select value={filters.block} onValueChange={v => setFilters(f => ({...f, block: v, panchayat: 'all', sgsDate: 'all'}))} disabled={filters.district === 'all'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Blocks</SelectItem>
                                        {blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label>Panchayat</label>
                                <Select value={filters.panchayat} onValueChange={v => setFilters(f => ({...f, panchayat: v, sgsDate: 'all'}))} disabled={filters.block === 'all'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Panchayats</SelectItem>
                                        {panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label>SGS Date</label>
                                <Select value={filters.sgsDate} onValueChange={v => setFilters(f => ({...f, sgsDate: v}))} disabled={filters.panchayat === 'all'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Select Date</SelectItem>
                                        {sgsDatesForPanchayat.map((d: any) => <SelectItem key={d.toString()} value={d.toString()}>{format(new Date(d), 'dd/MM/yyyy')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleGetReport} disabled={filters.sgsDate === 'all'}>Get Report</Button>
                        </div>
                        <div className="pt-4">
                            {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                            {!loading && selectedReport && (
                                <div ref={printRef}>
                                    <PmaygReportViewer entry={selectedReport as PmaygEntry} />
                                </div>
                            )}
                            {!loading && !selectedReport && (
                                 <div className="text-center p-16 text-muted-foreground">
                                    <FileText className="mx-auto h-12 w-12 mb-4" />
                                    <p>Please select your filters and click "Get Report" to view the social audit details.</p>
                                 </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

