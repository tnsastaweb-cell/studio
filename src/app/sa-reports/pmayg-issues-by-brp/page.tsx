
'use client';

import React, { useState, useMemo } from 'react';
import { usePmayg, PmaygEntry } from '@/services/pmayg-data';
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

const expenditureYears = ["2016-2022"];

type ReportRow = PmaygEntry & { 
    panchayatName: string;
    misappropriationIssues: number; misappropriationCentral: number; misappropriationState: number; misappropriationOther: number;
    processViolationIssues: number; processViolationCentral: number; processViolationState: number; processViolationOther: number;
    grievanceIssues: number; grievanceCentral: number; grievanceState: number; grievanceOther: number;
    totalIssues: number; totalCentral: number; totalState: number; totalOther: number;
};

const ReportTable = ({ data, loading }: { data: ReportRow[], loading: boolean }) => {

    const totalRow = useMemo(() => data.reduce((acc, row) => ({
        firstInstallment: acc.firstInstallment + (row.firstInstallment || 0),
        secondInstallment: acc.secondInstallment + (row.secondInstallment || 0),
        thirdInstallment: acc.thirdInstallment + (row.thirdInstallment || 0),
        fourthInstallment: acc.fourthInstallment + (row.fourthInstallment || 0),
        notCompletedAfterFourth: acc.notCompletedAfterFourth + (row.notCompletedAfterFourth || 0),
        misSeccSelected: acc.misSeccSelected + (row.misSeccSelected || 0),
        misAwaasPlusSelected: acc.misAwaasPlusSelected + (row.misAwaasPlusSelected || 0),
        totalHouses: acc.totalHouses + (row.totalHouses || 0),
        misappropriationIssues: acc.misappropriationIssues + row.misappropriationIssues,
        misappropriationCentral: acc.misappropriationCentral + row.misappropriationCentral,
        misappropriationState: acc.misappropriationState + row.misappropriationState,
        misappropriationOther: acc.misappropriationOther + row.misappropriationOther,
        processViolationIssues: acc.processViolationIssues + row.processViolationIssues,
        processViolationCentral: acc.processViolationCentral + row.processViolationCentral,
        processViolationState: acc.processViolationState + row.processViolationState,
        processViolationOther: acc.processViolationOther + row.processViolationOther,
        grievanceIssues: acc.grievanceIssues + row.grievanceIssues,
        grievanceCentral: acc.grievanceCentral + row.grievanceCentral,
        grievanceState: acc.grievanceState + row.grievanceState,
        grievanceOther: acc.grievanceOther + row.grievanceOther,
        totalIssues: acc.totalIssues + row.totalIssues,
        totalCentral: acc.totalCentral + row.totalCentral,
        totalState: acc.totalState + row.totalState,
        totalOther: acc.totalOther + row.totalOther,
    }), {
        firstInstallment: 0, secondInstallment: 0, thirdInstallment: 0, fourthInstallment: 0, notCompletedAfterFourth: 0,
        misSeccSelected: 0, misAwaasPlusSelected: 0, totalHouses: 0,
        misappropriationIssues: 0, misappropriationCentral: 0, misappropriationState: 0, misappropriationOther: 0,
        processViolationIssues: 0, processViolationCentral: 0, processViolationState: 0, processViolationOther: 0,
        grievanceIssues: 0, grievanceCentral: 0, grievanceState: 0, grievanceOther: 0,
        totalIssues: 0, totalCentral: 0, totalState: 0, totalOther: 0,
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
                        <TableHead rowSpan={2}>1st Installment</TableHead>
                        <TableHead rowSpan={2}>2nd Installment</TableHead>
                        <TableHead rowSpan={2}>3rd Installment</TableHead>
                        <TableHead rowSpan={2}>4th Installment</TableHead>
                        <TableHead rowSpan={2}>Not Completed After 4th</TableHead>
                        <TableHead rowSpan={2}>SECC Selected</TableHead>
                        <TableHead rowSpan={2}>Awaas+ Selected</TableHead>
                        <TableHead rowSpan={2}>Total Houses</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">முறைகேடு</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">செயல்முறை மீறல்</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">குறை</TableHead>
                        <TableHead colSpan={4} className="text-center border-l">Grand Total</TableHead>
                    </TableRow>
                     <TableRow>
                        <TableHead className="border-l">No of Issues</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                        <TableHead className="border-l">No of Issues</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                        <TableHead className="border-l">No of Issues</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                        <TableHead className="border-l">Total Issues</TableHead><TableHead>Total Central Amt</TableHead><TableHead>Total State Amt</TableHead><TableHead>Total Others Amt</TableHead>
                     </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow><TableCell colSpan={30} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={30} className="text-center h-24">No issues found for the selected filters.</TableCell></TableRow>
                    ) : (
                        <>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.brpName}</TableCell><TableCell>{row.brpEmployeeCode}</TableCell>
                                <TableCell>{toTitleCase(row.district)}</TableCell><TableCell>{toTitleCase(row.block)}</TableCell><TableCell>{toTitleCase(row.panchayatName)}</TableCell>
                                <TableCell>{row.firstInstallment}</TableCell><TableCell>{row.secondInstallment}</TableCell>
                                <TableCell>{row.thirdInstallment}</TableCell><TableCell>{row.fourthInstallment}</TableCell><TableCell>{row.notCompletedAfterFourth}</TableCell>
                                <TableCell>{row.misSeccSelected}</TableCell><TableCell>{row.misAwaasPlusSelected}</TableCell><TableCell>{row.totalHouses}</TableCell>
                                
                                <TableCell className="border-l">{row.misappropriationIssues}</TableCell><TableCell>{row.misappropriationCentral.toLocaleString()}</TableCell><TableCell>{row.misappropriationState.toLocaleString()}</TableCell><TableCell>{row.misappropriationOther.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.processViolationIssues}</TableCell><TableCell>{row.processViolationCentral.toLocaleString()}</TableCell><TableCell>{row.processViolationState.toLocaleString()}</TableCell><TableCell>{row.processViolationOther.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.grievanceIssues}</TableCell><TableCell>{row.grievanceCentral.toLocaleString()}</TableCell><TableCell>{row.grievanceState.toLocaleString()}</TableCell><TableCell>{row.grievanceOther.toLocaleString()}</TableCell>
                                <TableCell className="border-l">{row.totalIssues}</TableCell><TableCell>{row.totalCentral.toLocaleString()}</TableCell><TableCell>{row.totalState.toLocaleString()}</TableCell><TableCell>{row.totalOther.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={6} className="text-right">Total</TableCell>
                            <TableCell>{totalRow.firstInstallment}</TableCell><TableCell>{totalRow.secondInstallment}</TableCell>
                            <TableCell>{totalRow.thirdInstallment}</TableCell><TableCell>{totalRow.fourthInstallment}</TableCell><TableCell>{totalRow.notCompletedAfterFourth}</TableCell>
                            <TableCell>{totalRow.misSeccSelected}</TableCell><TableCell>{totalRow.misAwaasPlusSelected}</TableCell><TableCell>{totalRow.totalHouses}</TableCell>
                            
                            <TableCell className="border-l">{totalRow.misappropriationIssues}</TableCell><TableCell>{totalRow.misappropriationCentral.toLocaleString()}</TableCell><TableCell>{totalRow.misappropriationState.toLocaleString()}</TableCell><TableCell>{totalRow.misappropriationOther.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.processViolationIssues}</TableCell><TableCell>{totalRow.processViolationCentral.toLocaleString()}</TableCell><TableCell>{totalRow.processViolationState.toLocaleString()}</TableCell><TableCell>{totalRow.processViolationOther.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.grievanceIssues}</TableCell><TableCell>{totalRow.grievanceCentral.toLocaleString()}</TableCell><TableCell>{totalRow.grievanceState.toLocaleString()}</TableCell><TableCell>{totalRow.grievanceOther.toLocaleString()}</TableCell>
                            <TableCell className="border-l">{totalRow.totalIssues}</TableCell><TableCell>{totalRow.totalCentral.toLocaleString()}</TableCell><TableCell>{totalRow.totalState.toLocaleString()}</TableCell><TableCell>{totalRow.totalOther.toLocaleString()}</TableCell>
                        </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default function PmaygIssuesByBrpPage() {
    const { entries: pmaygEntries, loading: pmaygLoading } = usePmayg();
    const { users } = useUsers();
    
    const [filters, setFilters] = useState({
        expenditureYear: '2016-2022',
        brpEmployeeCode: 'all',
    });
    const [openBRPPopover, setOpenBRPPopover] = useState(false);
    const [isReportGenerated, setIsReportGenerated] = useState(false);

    const brpList = useMemo(() => users.filter(u => u.designation === 'BRP'), [users]);

    const reportData = useMemo(() => {
        if (!isReportGenerated) return [];
        
        const filteredEntries = pmaygEntries.filter(entry => {
            return (filters.expenditureYear === 'all' || entry.expenditureYear === filters.expenditureYear) &&
                   (filters.brpEmployeeCode === 'all' || entry.brpEmployeeCode === filters.brpEmployeeCode);
        });

        return filteredEntries.map(entry => {
            const paraSummary = entry.paraParticulars?.reduce((acc, para) => {
                const centralAmount = para.centralAmount || 0;
                const stateAmount = para.stateAmount || 0;
                const otherAmount = para.otherAmount || 0;
                
                acc.totalIssues += 1;
                acc.totalCentral += centralAmount;
                acc.totalState += stateAmount;
                acc.totalOther += otherAmount;

                if (para.type === 'முறைகேடு') { 
                    acc.misappropriationIssues += 1;
                    acc.misappropriationCentral += centralAmount;
                    acc.misappropriationState += stateAmount;
                    acc.misappropriationOther += otherAmount;
                } else if (para.type === 'செயல்முறை மீறல்') {
                    acc.processViolationIssues += 1;
                    acc.processViolationCentral += centralAmount;
                    acc.processViolationState += stateAmount;
                    acc.processViolationOther += otherAmount;
                } else if (para.type === 'குறை') {
                    acc.grievanceIssues += 1;
                    acc.grievanceCentral += centralAmount;
                    acc.grievanceState += stateAmount;
                    acc.grievanceOther += otherAmount;
                }
                return acc;
            }, { 
                misappropriationIssues: 0, misappropriationCentral: 0, misappropriationState: 0, misappropriationOther: 0,
                processViolationIssues: 0, processViolationCentral: 0, processViolationState: 0, processViolationOther: 0,
                grievanceIssues: 0, grievanceCentral: 0, grievanceState: 0, grievanceOther: 0,
                totalIssues: 0, totalCentral: 0, totalState: 0, totalOther: 0
            });

            return {
                ...entry,
                panchayatName: MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat)?.name || '',
                ...paraSummary,
            };
        });
    }, [pmaygEntries, filters, isReportGenerated]);
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>R.6.2.A.4 ISSUES REPORTED (BY BRP) - PMAYG</CardTitle>
                        <CardDescription>Filter and view issues reported for PMAY-G by BRP.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end mt-4">
                            <div className="space-y-2">
                                <label>Expenditure Year</label>
                                <Select value={filters.expenditureYear} onValueChange={(v) => setFilters(f => ({ ...f, expenditureYear: v }))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {expenditureYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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
                        {isReportGenerated && <ReportTable data={reportData} loading={pmaygLoading} />}
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
