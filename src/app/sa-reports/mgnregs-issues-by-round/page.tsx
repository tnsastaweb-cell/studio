
'use client';

import React, { useState, useMemo } from 'react';
import { useMgnregs, MgnregsEntry } from '@/services/mgnregs-data';
import { useUsers, User } from '@/services/users';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { toTitleCase, cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const expenditureYears = ["all", "2022-2023", "2023-2024", "2024-2025"];
const roundNos = ['all', 'Pilot - 1','Pilot - 2','Pilot - 3','Pilot - 4','Pilot - 5', '0', ...Array.from({length: 35}, (_, i) => (i + 1).toString())];

type ReportRow = MgnregsEntry & { 
    panchayatName: string;
    fmIssues: number; fmAmount: number;
    fdIssues: number; fdAmount: number;
    pvIssues: number; pvAmount: number;
    grIssues: number; grAmount: number;
    totalIssues: number;
    totalAmountAllIssues: number;
};

const ReportTable = ({ data, loading }: { data: ReportRow[], loading: boolean }) => {

    const totalRow = useMemo(() => data.reduce((acc, row) => ({
        totalWorks: acc.totalWorks + (row.totalWorks || 0),
        totalAmount: acc.totalAmount + (row.totalAmount || 0),
        fmIssues: acc.fmIssues + row.fmIssues,
        fmAmount: acc.fmAmount + row.fmAmount,
        fdIssues: acc.fdIssues + row.fdIssues,
        fdAmount: acc.fdAmount + row.fdAmount,
        pvIssues: acc.pvIssues + row.pvIssues,
        pvAmount: acc.pvAmount + row.pvAmount,
        grIssues: acc.grIssues + row.grIssues,
        grAmount: acc.grAmount + row.grAmount,
        totalIssues: acc.totalIssues + row.totalIssues,
        totalAmountAllIssues: acc.totalAmountAllIssues + row.totalAmountAllIssues,
    }), {
        totalWorks: 0, totalAmount: 0,
        fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0, pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0, totalIssues: 0, totalAmountAllIssues: 0
    }), [data]);
    

    return (
        <div className="w-full overflow-x-auto border rounded-lg mt-4">
            <Table className="min-w-max">
                <TableHeader>
                    <TableRow>
                        <TableHead rowSpan={2}>Sl.No</TableHead>
                        <TableHead rowSpan={2}>Round No</TableHead>
                        <TableHead rowSpan={2}>District</TableHead>
                        <TableHead rowSpan={2}>Block</TableHead>
                        <TableHead rowSpan={2}>Panchayat</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">Total</TableHead>
                        <TableHead rowSpan={2} className="border-l">BRP Name</TableHead>
                        <TableHead rowSpan={2}>Emp. Code</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">FM</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">FD</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">PV</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">GR</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">Grand Total</TableHead>
                    </TableRow>
                     <TableRow>
                        <TableHead className="border-l">Total Works</TableHead><TableHead>Total Exp. Amt</TableHead>
                        <TableHead className="border-l">Issues</TableHead><TableHead>Amt</TableHead>
                        <TableHead className="border-l">Issues</TableHead><TableHead>Amt</TableHead>
                        <TableHead className="border-l">Issues</TableHead><TableHead>Amt</TableHead>
                        <TableHead className="border-l">Issues</TableHead><TableHead>Amt</TableHead>
                        <TableHead className="border-l">Total Issues</TableHead><TableHead>Total Amt</TableHead>
                     </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow><TableCell colSpan={21} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={21} className="text-center h-24">No issues found for the selected filters.</TableCell></TableRow>
                    ) : (
                        <>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.roundNo}</TableCell>
                                <TableCell>{toTitleCase(row.district)}</TableCell><TableCell>{toTitleCase(row.block)}</TableCell><TableCell>{toTitleCase(row.panchayatName)}</TableCell>
                                <TableCell className="border-l">{row.totalWorks}</TableCell><TableCell>{row.totalAmount?.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.brpName}</TableCell><TableCell>{row.brpEmployeeCode}</TableCell>
                                <TableCell className="border-l">{row.fmIssues}</TableCell><TableCell>{row.fmAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.fdIssues}</TableCell><TableCell>{row.fdAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.pvIssues}</TableCell><TableCell>{row.pvAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.grIssues}</TableCell><TableCell>{row.grAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.totalIssues}</TableCell><TableCell>{row.totalAmountAllIssues.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={5} className="text-right">Total</TableCell>
                            <TableCell className="border-l">{totalRow.totalWorks}</TableCell><TableCell>{totalRow.totalAmount.toLocaleString()}</TableCell>
                            <TableCell colSpan={2} className="border-l"></TableCell>
                            <TableCell className="border-l">{totalRow.fmIssues}</TableCell><TableCell>{totalRow.fmAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.fdIssues}</TableCell><TableCell>{totalRow.fdAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.pvIssues}</TableCell><TableCell>{totalRow.pvAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.grIssues}</TableCell><TableCell>{totalRow.grAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.totalIssues}</TableCell><TableCell>{totalRow.totalAmountAllIssues.toLocaleString()}</TableCell>
                        </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default function MgnregsIssuesByRoundPage() {
    const { entries: mgnregsEntries, loading: mgnregsLoading } = useMgnregs();
    
    const [filters, setFilters] = useState({
        expenditureYear: 'all',
        roundNo: 'all',
    });
    const [isReportGenerated, setIsReportGenerated] = useState(false);

    const reportData = useMemo(() => {
        if (!isReportGenerated) return [];
        
        const filteredEntries = mgnregsEntries.filter(entry => {
            return (filters.expenditureYear === 'all' || entry.expenditureYear === filters.expenditureYear) &&
                   (filters.roundNo === 'all' || entry.roundNo === filters.roundNo);
        });

        return filteredEntries.map(entry => {
            const paraSummary = entry.paraParticulars?.reduce((acc, para) => {
                const amount = para.amount || 0;
                acc.totalIssues += 1;
                acc.totalAmountAllIssues += amount;
                switch (para.type) {
                    case 'FM - Financial Misappropriation': acc.fmIssues += 1; acc.fmAmount += amount; break;
                    case 'FD - Financial Deviation': acc.fdIssues += 1; acc.fdAmount += amount; break;
                    case 'PV - Process Violation': acc.pvIssues += 1; acc.pvAmount += amount; break;
                    case 'GR - Grievances': acc.grIssues += 1; acc.grAmount += amount; break;
                }
                return acc;
            }, { fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0, pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0, totalIssues: 0, totalAmountAllIssues: 0 });

            return {
                ...entry,
                panchayatName: MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat)?.name || '',
                ...paraSummary,
            };
        });
    }, [mgnregsEntries, filters, isReportGenerated]);
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>R.6.1.A.5 ISSUES REPORTED (BY ROUND)</CardTitle>
                        <CardDescription>Filter and view issues reported for MGNREGS by Round No.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end mt-4">
                            <div className="space-y-2">
                                <label>Expenditure Year</label>
                                <Select value={filters.expenditureYear} onValueChange={(v) => setFilters(f => ({ ...f, expenditureYear: v }))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {expenditureYears.filter(y => y !== 'all').map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                 <label>Round No</label>
                                 <Select value={filters.roundNo} onValueChange={(v) => setFilters(f => ({ ...f, roundNo: v }))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {roundNos.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             </div>
                            <Button onClick={() => setIsReportGenerated(true)}>Get Report</Button>
                        </div>
                        {isReportGenerated && <ReportTable data={reportData} loading={mgnregsLoading} />}
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
