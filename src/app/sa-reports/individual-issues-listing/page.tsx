
'use client';

import React, { useState, useMemo, FC } from 'react';
import { useMgnregs, MgnregsEntry } from '@/services/mgnregs-data';
import { usePmayg, PmaygEntry } from '@/services/pmayg-data';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';
import { MOCK_SCHEMES } from '@/services/schemes';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const years = ["2023-2024", "2022-2023", "2021-2022", "all"];
const statuses = ["PENDING", "CLOSED", "all"];

const mgnregsTypes = Array.from(new Set(MOCK_MGNREGS_DATA.map(d => d.type)));
const pmaygTypes = Array.from(new Set(MOCK_PMAYG_DATA.map(d => d.type)));


const ReportTable = ({ data, scheme, loading }: { data: any[], scheme: string, loading: boolean }) => {
    return (
        <div className="border rounded-lg mt-4 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sl. No</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Block</TableHead>
                        <TableHead>Panchayat</TableHead>
                        <TableHead>SGS Date</TableHead>
                        <TableHead>Issue No</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Code No.</TableHead>
                        {scheme === 'MGNREGS' && <TableHead>Amount</TableHead>}
                        {scheme === 'PMAY-G' && (
                            <>
                                <TableHead>Central Amount</TableHead>
                                <TableHead>State Amount</TableHead>
                                <TableHead>Others Amount</TableHead>
                            </>
                        )}
                        <TableHead>Recovered Amount</TableHead>
                        <TableHead>HLC Recovery Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow><TableCell colSpan={scheme === 'MGNREGS' ? 12 : 14} className="text-center h-24"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                    ) : data.length === 0 ? (
                        <TableRow><TableCell colSpan={scheme === 'MGNREGS' ? 12 : 14} className="text-center h-24">No issues found for the selected filters.</TableCell></TableRow>
                    ) : (
                        data.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.district}</TableCell>
                                <TableCell>{item.block}</TableCell>
                                <TableCell>{MOCK_PANCHAYATS.find(p => p.lgdCode === item.panchayat)?.name || ''}</TableCell>
                                <TableCell>{format(new Date(item.sgsDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{item.para.issueNumber}</TableCell>
                                <TableCell>{item.para.type}</TableCell>
                                <TableCell>{item.para.codeNumber}</TableCell>
                                {scheme === 'MGNREGS' && <TableCell>{item.para.amount?.toLocaleString()}</TableCell>}
                                {scheme === 'PMAY-G' && (
                                    <>
                                        <TableCell>{item.para.centralAmount?.toLocaleString()}</TableCell>
                                        <TableCell>{item.para.stateAmount?.toLocaleString()}</TableCell>
                                        <TableCell>{item.para.otherAmount?.toLocaleString()}</TableCell>
                                    </>
                                )}
                                <TableCell>{item.para.recoveredAmount?.toLocaleString()}</TableCell>
                                <TableCell>{item.para.hlcRecoveryAmount?.toLocaleString()}</TableCell>
                                <TableCell>{item.para.paraStatus}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default function IndividualIssuesListingPage() {
    const { entries: mgnregsEntries, loading: mgnregsLoading } = useMgnregs();
    const { entries: pmaygEntries, loading: pmaygLoading } = usePmayg();
    const [currentScheme, setCurrentScheme] = useState('MGNREGS');
    
    const [filters, setFilters] = useState({
        auditYear: 'all', district: 'all', block: 'all', panchayat: 'all',
        status: 'all', type: 'all', category: 'all', subCategory: 'all', codeNumber: 'all',
    });

    const [filteredReportData, setFilteredReportData] = useState<any[]>([]);
     const [isReportGenerated, setIsReportGenerated] = useState(false);

    const flattenedMgnregs = useMemo(() => mgnregsEntries.flatMap(entry => (entry.paraParticulars || []).map(para => ({ ...entry, para }))), [mgnregsEntries]);
    const flattenedPmayg = useMemo(() => pmaygEntries.flatMap(entry => (entry.paraParticulars || []).map(para => ({ ...entry, para }))), [pmaygEntries]);
    
    const handleGetReport = () => {
        const sourceData = currentScheme === 'MGNREGS' ? flattenedMgnregs : flattenedPmayg;
        
        const result = sourceData.filter(item => {
            return (filters.auditYear === 'all' || item.auditYear === filters.auditYear) &&
                   (filters.district === 'all' || item.district === filters.district) &&
                   (filters.block === 'all' || item.block === filters.block) &&
                   (filters.panchayat === 'all' || item.panchayat === filters.panchayat) &&
                   (filters.status === 'all' || item.para.paraStatus === filters.status) &&
                   (filters.type === 'all' || item.para.type === filters.type) &&
                   (filters.category === 'all' || item.para.category === filters.category) &&
                   (filters.subCategory === 'all' || item.para.subCategory === filters.subCategory) &&
                   (filters.codeNumber === 'all' || item.para.codeNumber === filters.codeNumber);
        });

        setFilteredReportData(result);
        setIsReportGenerated(true);
    };
    
    const resetFilters = () => {
        setFilters({
            auditYear: 'all', district: 'all', block: 'all', panchayat: 'all',
            status: 'all', type: 'all', category: 'all', subCategory: 'all', codeNumber: 'all',
        });
        setFilteredReportData([]);
        setIsReportGenerated(false);
    }

    const blocksForDistrict = useMemo(() => {
        if (filters.district === 'all') return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === filters.district).map(p => p.block))).sort();
    }, [filters.district]);

    const panchayatsForBlock = useMemo(() => {
        if (filters.block === 'all') return [];
        return MOCK_PANCHAYATS.filter(p => p.block === filters.block).sort((a,b) => a.name.localeCompare(b.name));
    }, [filters.block]);
    
    const categoriesForType = useMemo(() => {
        if (filters.type === 'all') return [];
        const source = currentScheme === 'MGNREGS' ? MOCK_MGNREGS_DATA : MOCK_PMAYG_DATA;
        return Array.from(new Set(source.filter(d => d.type === filters.type).map(d => d.category)));
    }, [filters.type, currentScheme]);

    const subCategoriesForCategory = useMemo(() => {
        if (filters.category === 'all') return [];
        const source = currentScheme === 'MGNREGS' ? MOCK_MGNREGS_DATA : MOCK_PMAYG_DATA;
        return Array.from(new Set(source.filter(d => d.type === filters.type && d.category === filters.category).map(d => d.subCategory)));
    }, [filters.category, filters.type, currentScheme]);

    const codesForSubCategory = useMemo(() => {
        if(filters.subCategory === 'all') return [];
        const source = currentScheme === 'MGNREGS' ? MOCK_MGNREGS_DATA : MOCK_PMAYG_DATA;
        return source.filter(d => d.type === filters.type && d.category === filters.category && d.subCategory === filters.subCategory);
    }, [filters.subCategory, filters.category, filters.type, currentScheme]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => {
            const newFilters = {...prev, [filterName]: value};
            if(filterName === 'district') {
                newFilters.block = 'all';
                newFilters.panchayat = 'all';
            }
            if(filterName === 'block') {
                newFilters.panchayat = 'all';
            }
             if(filterName === 'type') {
                newFilters.category = 'all';
                newFilters.subCategory = 'all';
                newFilters.codeNumber = 'all';
            }
             if(filterName === 'category') {
                newFilters.subCategory = 'all';
                newFilters.codeNumber = 'all';
            }
             if(filterName === 'subCategory') {
                newFilters.codeNumber = 'all';
            }
            return newFilters;
        });
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>R.6.1.A.2 & R.6.2.A.2 - Individual Issues Listing</CardTitle>
                        <CardDescription>Filter and view individual issues reported for different schemes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="MGNREGS" onValueChange={(val) => { setCurrentScheme(val); resetFilters(); }}>
                            <TabsList>
                                <TabsTrigger value="MGNREGS">MGNREGS</TabsTrigger>
                                <TabsTrigger value="PMAY-G">PMAY-G</TabsTrigger>
                            </TabsList>
                            <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end mt-4">
                                <Select value={filters.auditYear} onValueChange={(v) => handleFilterChange('auditYear', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.district} onValueChange={(v) => handleFilterChange('district', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Districts</SelectItem>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{toTitleCase(d)}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.block} onValueChange={(v) => handleFilterChange('block', v)} disabled={filters.district === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Blocks</SelectItem>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{toTitleCase(b)}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.panchayat} onValueChange={(v) => handleFilterChange('panchayat', v)} disabled={filters.block === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Panchayats</SelectItem>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{toTitleCase(p.name)}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{statuses.filter(s => s !== 'all').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{(currentScheme === 'MGNREGS' ? mgnregsTypes : pmaygTypes).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)} disabled={filters.type === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categoriesForType.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.subCategory} onValueChange={(v) => handleFilterChange('subCategory', v)} disabled={filters.category === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Sub-Categories</SelectItem>{subCategoriesForCategory.map(sc => <SelectItem key={sc} value={sc} className="whitespace-normal">{sc}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.codeNumber} onValueChange={(v) => handleFilterChange('codeNumber', v)} disabled={filters.subCategory === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Codes</SelectItem>{codesForSubCategory.map(c => <SelectItem key={c.codeNumber} value={c.codeNumber}>{c.codeNumber}</SelectItem>)}</SelectContent></Select>
                                <div className="flex gap-2 lg:col-start-5">
                                    <Button onClick={handleGetReport} className="w-full">Get Report</Button>
                                    <Button variant="outline" onClick={resetFilters}><RefreshCw className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <TabsContent value="MGNREGS">
                                {isReportGenerated && <ReportTable data={filteredReportData} scheme="MGNREGS" loading={mgnregsLoading} />}
                            </TabsContent>
                            <TabsContent value="PMAY-G">
                                 {isReportGenerated && <ReportTable data={filteredReportData} scheme="PMAY-G" loading={pmaygLoading} />}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
