
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';

const years = ["2022-2023", "2023-2024", "2024-2025"];

type ReportRow = MgnregsEntry & { 
    panchayatName: string;
    fmIssues: number; fmAmount: number;
    fdIssues: number; fdAmount: number;
    pvIssues: number; pvAmount: number;
    grIssues: number; grAmount: number;
    totalIssues: number;
};

const ReportTable = ({ data, loading }: { data: ReportRow[], loading: boolean }) => {

    const totalRow = useMemo(() => data.reduce((acc, row) => ({
        ...acc,
        pvtIndividualLandWorks: acc.pvtIndividualLandWorks + (row.pvtIndividualLandWorks || 0),
        pvtIndividualLandAmount: acc.pvtIndividualLandAmount + (row.pvtIndividualLandAmount || 0),
        pvtIndividualAssetsWorks: acc.pvtIndividualAssetsWorks + (row.pvtIndividualAssetsWorks || 0),
        pvtIndividualAssetsAmount: acc.pvtIndividualAssetsAmount + (row.pvtIndividualAssetsAmount || 0),
        pubCommunityLandWorks: acc.pubCommunityLandWorks + (row.pubCommunityLandWorks || 0),
        pubCommunityLandAmount: acc.pubCommunityLandAmount + (row.pubCommunityLandAmount || 0),
        pubCommunityAssetsWorks: acc.pubCommunityAssetsWorks + (row.pubCommunityAssetsWorks || 0),
        pubCommunityAssetsAmount: acc.pubCommunityAssetsAmount + (row.pubCommunityAssetsAmount || 0),
        skilledSemiSkilledAmount: acc.skilledSemiSkilledAmount + (row.skilledSemiSkilledAmount || 0),
        materialAmount: acc.materialAmount + (row.materialAmount || 0),
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
    }), {
        pvtIndividualLandWorks: 0, pvtIndividualLandAmount: 0, pvtIndividualAssetsWorks: 0, pvtIndividualAssetsAmount: 0,
        pubCommunityLandWorks: 0, pubCommunityLandAmount: 0, pubCommunityAssetsWorks: 0, pubCommunityAssetsAmount: 0,
        skilledSemiSkilledAmount: 0, materialAmount: 0, totalWorks: 0, totalAmount: 0,
        fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0, pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0, totalIssues: 0
    }), [data]);
    

    return (
        <div className="w-full overflow-x-auto border rounded-lg mt-4">
            <Table className="min-w-max">
                <TableHeader>
                    <TableRow>
                        <TableHead rowSpan={2}>Sl.No</TableHead>
                        <TableHead rowSpan={2}>BRP Name</TableHead>
                        <TableHead rowSpan={2}>Emp. Code</TableHead>
                        <TableHead rowSpan={2}>District</TableHead>
                        <TableHead rowSpan={2}>Block</TableHead>
                        <TableHead rowSpan={2}>Panchayat</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">Private</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">Public</TableHead>
                        <TableHead rowSpan={2} className="border-l">Skilled/Semi Skilled Amt.</TableHead>
                        <TableHead rowSpan={2}>Material Exp. Amt.</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">Total</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">FM</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">FD</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">PV</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">GR</TableHead>
                        <TableHead colSpan={2} className="text-center border-l">Grand Total</TableHead>
                    </TableRow>
                     <TableRow>
                        <TableHead className="border-l">Ind. Land (Works)</TableHead><TableHead>Ind. Land (Amt)</TableHead>
                        <TableHead>Ind. Assets (Works)</TableHead><TableHead>Ind. Assets (Amt)</TableHead>
                        <TableHead className="border-l">Comm. Land (Works)</TableHead><TableHead>Comm. Land (Amt)</TableHead>
                        <TableHead>Comm. Assets (Works)</TableHead><TableHead>Comm. Assets (Amt)</TableHead>
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
                         <TableRow><TableCell colSpan={27} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={27} className="text-center h-24">No issues found for the selected filters.</TableCell></TableRow>
                    ) : (
                        <>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.brpName}</TableCell><TableCell>{row.brpEmployeeCode}</TableCell>
                                <TableCell>{toTitleCase(row.district)}</TableCell><TableCell>{toTitleCase(row.block)}</TableCell><TableCell>{toTitleCase(row.panchayatName)}</TableCell>
                                <TableCell className="border-l">{row.pvtIndividualLandWorks}</TableCell><TableCell>{row.pvtIndividualLandAmount?.toLocaleString()}</TableCell>
                                <TableCell>{row.pvtIndividualAssetsWorks}</TableCell><TableCell>{row.pvtIndividualAssetsAmount?.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.pubCommunityLandWorks}</TableCell><TableCell>{row.pubCommunityLandAmount?.toLocaleString()}</TableCell>
                                <TableCell>{row.pubCommunityAssetsWorks}</TableCell><TableCell>{row.pubCommunityAssetsAmount?.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.skilledSemiSkilledAmount?.toLocaleString()}</TableCell>
                                <TableCell>{row.materialAmount?.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.totalWorks}</TableCell><TableCell>{row.totalAmount?.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.fmIssues}</TableCell><TableCell>{row.fmAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.fdIssues}</TableCell><TableCell>{row.fdAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.pvIssues}</TableCell><TableCell>{row.pvAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.grIssues}</TableCell><TableCell>{row.grAmount.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.totalIssues}</TableCell><TableCell>{row.totalAmount?.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={6} className="text-right">Total</TableCell>
                            <TableCell className="border-l">{totalRow.pvtIndividualLandWorks}</TableCell><TableCell>{totalRow.pvtIndividualLandAmount.toLocaleString()}</TableCell>
                            <TableCell>{totalRow.pvtIndividualAssetsWorks}</TableCell><TableCell>{totalRow.pvtIndividualAssetsAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.pubCommunityLandWorks}</TableCell><TableCell>{totalRow.pubCommunityLandAmount.toLocaleString()}</TableCell>
                            <TableCell>{totalRow.pubCommunityAssetsWorks}</TableCell><TableCell>{totalRow.pubCommunityAssetsAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.skilledSemiSkilledAmount.toLocaleString()}</TableCell>
                            <TableCell>{totalRow.materialAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.totalWorks}</TableCell><TableCell>{totalRow.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.fmIssues}</TableCell><TableCell>{totalRow.fmAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.fdIssues}</TableCell><TableCell>{totalRow.fdAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.pvIssues}</TableCell><TableCell>{totalRow.pvAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.grIssues}</TableCell><TableCell>{totalRow.grAmount.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.totalIssues}</TableCell><TableCell>{totalRow.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default function MgnregsIssuesByBrpPage() {
    const { entries: mgnregsEntries, loading: mgnregsLoading } = useMgnregs();
    const { users } = useUsers();
    
    const [filters, setFilters] = useState({
        expenditureYear: 'all',
        brpEmployeeCode: 'all',
    });
    const [openBRPPopover, setOpenBRPPopover] = useState(false);
    const [isReportGenerated, setIsReportGenerated] = useState(false);

    const brpList = useMemo(() => users.filter(u => u.designation === 'BRP'), [users]);

    const reportData = useMemo(() => {
        if (!isReportGenerated) return [];
        
        const filteredEntries = mgnregsEntries.filter(entry => {
            return (filters.expenditureYear === 'all' || entry.expenditureYear === filters.expenditureYear) &&
                   (filters.brpEmployeeCode === 'all' || entry.brpEmployeeCode === filters.brpEmployeeCode);
        });

        return filteredEntries.map(entry => {
            const paraSummary = entry.paraParticulars?.reduce((acc, para) => {
                const amount = para.amount || 0;
                acc.totalIssues += 1;
                switch (para.type) {
                    case 'FM - Financial Misappropriation': acc.fmIssues += 1; acc.fmAmount += amount; break;
                    case 'FD - Financial Deviation': acc.fdIssues += 1; acc.fdAmount += amount; break;
                    case 'PV - Process Violation': acc.pvIssues += 1; acc.pvAmount += amount; break;
                    case 'GR - Grievances': acc.grIssues += 1; acc.grAmount += amount; break;
                }
                return acc;
            }, { fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0, pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0, totalIssues: 0 });

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
                        <CardTitle>R.6.1.A.4 ISSUES REPORTED (BY BRP)</CardTitle>
                        <CardDescription>Filter and view issues reported for MGNREGS by BRP.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end mt-4">
                            <div className="space-y-2">
                                <label>Expenditure Year</label>
                                <Select value={filters.expenditureYear} onValueChange={(v) => setFilters(f => ({ ...f, expenditureYear: v }))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                 <label>BRP Name</label>
                                 <Popover open={openBRPPopover} onOpenChange={setOpenBRPPopover}>
                                     <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {filters.brpEmployeeCode !== 'all' ? brpList.find(brp => brp.employeeCode === filters.brpEmployeeCode)?.name : "Select BRP..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                     <PopoverContent className="w-[300px] p-0">
                                         <Command>
                                            <CommandInput placeholder="Search BRP..."/>
                                             <CommandEmpty>No BRP found.</CommandEmpty>
                                             <CommandList>
                                                 <CommandItem onSelect={() => {setFilters(f => ({...f, brpEmployeeCode: 'all'})); setOpenBRPPopover(false);}}>All BRPs</CommandItem>
                                                 {brpList.map((brp) => (
                                                    <CommandItem
                                                        key={brp.id}
                                                        value={`${brp.name} ${brp.employeeCode}`}
                                                        onSelect={() => {
                                                            setFilters(f => ({...f, brpEmployeeCode: brp.employeeCode}));
                                                            setOpenBRPPopover(false);
                                                        }}
                                                    >
                                                         <Check className={cn("mr-2 h-4 w-4", filters.brpEmployeeCode === brp.employeeCode ? "opacity-100" : "opacity-0")} />
                                                         {brp.name} ({brp.employeeCode})
                                                    </CommandItem>
                                                 ))}
                                             </CommandList>
                                         </Command>
                                     </PopoverContent>
                                 </Popover>
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
