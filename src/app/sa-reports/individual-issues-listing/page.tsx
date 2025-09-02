
'use client';

import React, { useState, useMemo } from 'react';
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

const years = ["2023-2024", "2022-2023", "2021-2022"];
const statuses = ["PENDING", "CLOSED"];

const mgnregsTypes = Array.from(new Set(MOCK_MGNREGS_DATA.map(d => d.type)));
const pmaygTypes = Array.from(new Set(MOCK_PMAYG_DATA.map(d => d.type)));


const ReportTable = ({ data, scheme }: { data: any[], scheme: string }) => {
    return (
        <div className="border rounded-lg mt-4">
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
                    {data.length === 0 ? (
                        <TableRow><TableCell colSpan={scheme === 'MGNREGS' ? 11 : 13} className="text-center">No issues found.</TableCell></TableRow>
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

    const [filters, setFilters] = useState({
        auditYear: 'all',
        district: 'all',
        block: 'all',
        panchayat: 'all',
        status: 'all',
        type: 'all',
        category: 'all',
        subCategory: 'all'
    });

    const [filteredReportData, setFilteredReportData] = useState<any[]>([]);

    const flattenedMgnregs = useMemo(() => {
        return mgnregsEntries.flatMap(entry =>
            (entry.paraParticulars || []).map(para => ({ ...entry, para }))
        );
    }, [mgnregsEntries]);

    const flattenedPmayg = useMemo(() => {
        return pmaygEntries.flatMap(entry =>
            (entry.paraParticulars || []).map(para => ({ ...entry, para }))
        );
    }, [pmaygEntries]);
    
    const handleGetReport = (scheme: 'MGNREGS' | 'PMAY-G') => {
        const sourceData = scheme === 'MGNREGS' ? flattenedMgnregs : flattenedPmayg;
        
        const result = sourceData.filter(item => {
            return (filters.auditYear === 'all' || item.auditYear === filters.auditYear) &&
                   (filters.district === 'all' || item.district === filters.district) &&
                   (filters.block === 'all' || item.block === filters.block) &&
                   (filters.panchayat === 'all' || item.panchayat === filters.panchayat) &&
                   (filters.status === 'all' || item.para.paraStatus === filters.status) &&
                   (filters.type === 'all' || item.para.type === filters.type) &&
                   (filters.category === 'all' || item.para.category === filters.category) &&
                   (filters.subCategory === 'all' || item.para.subCategory === filters.subCategory);
        });

        setFilteredReportData(result);
    };

    const blocksForDistrict = useMemo(() => {
        if (filters.district === 'all') return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === filters.district).map(p => p.block))).sort();
    }, [filters.district]);

    const panchayatsForBlock = useMemo(() => {
        if (filters.block === 'all') return [];
        return MOCK_PANCHAYATS.filter(p => p.block === filters.block).sort((a,b) => a.name.localeCompare(b.name));
    }, [filters.block]);
    
    const categoriesForType = (scheme: 'MGNREGS' | 'PMAY-G') => {
        if (filters.type === 'all') return [];
        const source = scheme === 'MGNREGS' ? MOCK_MGNREGS_DATA : MOCK_PMAYG_DATA;
        return Array.from(new Set(source.filter(d => d.type === filters.type).map(d => d.category)));
    };

    const subCategoriesForCategory = (scheme: 'MGNREGS' | 'PMAY-G') => {
        if (filters.category === 'all') return [];
        const source = scheme === 'MGNREGS' ? MOCK_MGNREGS_DATA : MOCK_PMAYG_DATA;
        return source.filter(d => d.type === filters.type && d.category === filters.category).map(d => d.subCategory);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>R.6.1.A.2 Individual Issues Listing</CardTitle>
                        <CardDescription>Filter and view individual issues reported for different schemes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="MGNREGS" onValueChange={() => { setFilteredReportData([]); form.reset() }}>
                            <TabsList>
                                <TabsTrigger value="MGNREGS">MGNREGS</TabsTrigger>
                                <TabsTrigger value="PMAY-G">PMAY-G</TabsTrigger>
                            </TabsList>
                            <TabsContent value="MGNREGS" className="pt-4">
                                <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                    <Select value={filters.auditYear} onValueChange={(v) => setFilters(f => ({ ...f, auditYear: v }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.district} onValueChange={(v) => setFilters(f => ({ ...f, district: v, block: 'all', panchayat: 'all' }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Districts</SelectItem>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{toTitleCase(d)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.block} onValueChange={(v) => setFilters(f => ({ ...f, block: v, panchayat: 'all' }))} disabled={filters.district === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Blocks</SelectItem>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{toTitleCase(b)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.panchayat} onValueChange={(v) => setFilters(f => ({ ...f, panchayat: v }))} disabled={filters.block === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Panchayats</SelectItem>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{toTitleCase(p.name)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.status} onValueChange={(v) => setFilters(f => ({...f, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.type} onValueChange={(v) => setFilters(f => ({...f, type: v, category: 'all', subCategory: 'all'}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{mgnregsTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v, subCategory: 'all'}))} disabled={filters.type === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categoriesForType('MGNREGS').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.subCategory} onValueChange={(v) => setFilters(f => ({...f, subCategory: v}))} disabled={filters.category === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Sub-Categories</SelectItem>{subCategoriesForCategory('MGNREGS').map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent></Select>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleGetReport('MGNREGS')} className="w-full">Get Report</Button>
                                        <Button variant="outline" onClick={() => { setFilters({ ...filters, auditYear: 'all', district: 'all', block: 'all', panchayat: 'all', status: 'all', type: 'all', category: 'all', subCategory: 'all' }); setFilteredReportData([]); }}><RefreshCw /></Button>
                                    </div>
                                </div>
                                <ReportTable data={filteredReportData} scheme="MGNREGS"/>
                            </TabsContent>
                             <TabsContent value="PMAY-G" className="pt-4">
                                <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                    <Select value={filters.auditYear} onValueChange={(v) => setFilters(f => ({ ...f, auditYear: v }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.district} onValueChange={(v) => setFilters(f => ({ ...f, district: v, block: 'all', panchayat: 'all' }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Districts</SelectItem>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{toTitleCase(d)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.block} onValueChange={(v) => setFilters(f => ({ ...f, block: v, panchayat: 'all' }))} disabled={filters.district === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Blocks</SelectItem>{blocksForDistrict.map(b => <SelectItem key={b} value={b}>{toTitleCase(b)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.panchayat} onValueChange={(v) => setFilters(f => ({ ...f, panchayat: v }))} disabled={filters.block === 'all'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Panchayats</SelectItem>{panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{toTitleCase(p.name)}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.status} onValueChange={(v) => setFilters(f => ({...f, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.type} onValueChange={(v) => setFilters(f => ({...f, type: v, category: 'all', subCategory: 'all'}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{pmaygTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v, subCategory: 'all'}))} disabled={filters.type === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categoriesForType('PMAY-G').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                    <Select value={filters.subCategory} onValueChange={(v) => setFilters(f => ({...f, subCategory: v}))} disabled={filters.category === 'all'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Sub-Categories</SelectItem>{subCategoriesForCategory('PMAY-G').map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}</SelectContent></Select>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleGetReport('PMAY-G')} className="w-full">Get Report</Button>
                                        <Button variant="outline" onClick={() => { setFilters({ ...filters, auditYear: 'all', district: 'all', block: 'all', panchayat: 'all', status: 'all', type: 'all', category: 'all', subCategory: 'all' }); setFilteredReportData([]); }}><RefreshCw /></Button>
                                    </div>
                                </div>
                                <ReportTable data={filteredReportData} scheme="PMAY-G"/>
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

// Dummy form to prevent error on tabs change
const form = { reset: () => {} };
