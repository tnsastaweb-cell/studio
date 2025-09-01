
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Edit, Search } from 'lucide-react';

import { useMgnregs } from '@/services/mgnregs-data';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { uniqueDistricts } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HighFmParaDetailsPage() {
    const { entries, loading } = useMgnregs();
    const { user } = useAuth();
    const router = useRouter();

    const [filters, setFilters] = useState({
        search: '',
        district: 'all',
        block: 'all',
        panchayat: 'all'
    });

    const highFmParas = useMemo(() => {
        return entries.flatMap(entry => 
            (entry.paraParticulars || [])
            .filter(para => para.type === 'FM - Financial Misappropriation' && (para.amount || 0) >= 10000)
            .map(para => ({ ...entry, paraDetails: para }))
        );
    }, [entries]);

    const filteredData = useMemo(() => {
        return highFmParas.filter(item => {
            const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === item.panchayat)?.name || '';
            const searchLower = filters.search.toLowerCase();
            
            const searchMatch = !filters.search ? true : (
                panchayatName.toLowerCase().includes(searchLower) ||
                item.brpName.toLowerCase().includes(searchLower) ||
                item.paraDetails.issueNumber.toLowerCase().includes(searchLower)
            );
            const districtMatch = filters.district === 'all' || item.district === filters.district;
            const blockMatch = filters.block === 'all' || item.block === filters.block;
            const panchayatMatch = filters.panchayat === 'all' || item.panchayat === filters.panchayat;

            return searchMatch && districtMatch && blockMatch && panchayatMatch;
        });
    }, [highFmParas, filters]);

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>High FM Para Details</CardTitle>
                        <CardDescription>Details of Financial Misappropriation paras with amounts of ₹10,000 and above.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="relative md:col-span-2">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                 <Input 
                                    placeholder="Search by Panchayat, BRP, Issue No..." 
                                    className="pl-10"
                                    value={filters.search}
                                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                 />
                            </div>
                            <Select value={filters.district} onValueChange={v => setFilters(f => ({ ...f, district: v, block: 'all', panchayat: 'all' }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {/* Further filtering can be added for block and panchayat if needed */}
                        </div>

                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl. No</TableHead>
                                        <TableHead>Round No</TableHead>
                                        <TableHead>SGS Date</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Block</TableHead>
                                        <TableHead>Panchayat</TableHead>
                                        <TableHead>Issue No.</TableHead>
                                        <TableHead>BRP Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        {canEdit && <TableHead className="text-right">Action</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={canEdit ? 10 : 9} className="text-center">Loading data...</TableCell></TableRow>
                                    ) : filteredData.length === 0 ? (
                                         <TableRow><TableCell colSpan={canEdit ? 10 : 9} className="text-center">No high value FM paras found.</TableCell></TableRow>
                                    ) : (
                                        filteredData.map((item, index) => (
                                            <TableRow key={`${item.id}-${item.paraDetails.issueNumber}`}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.roundNo}</TableCell>
                                                <TableCell>{format(new Date(item.sgsDate), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>{item.district}</TableCell>
                                                <TableCell>{item.block}</TableCell>
                                                <TableCell>{MOCK_PANCHAYATS.find(p => p.lgdCode === item.panchayat)?.name || ''}</TableCell>
                                                <TableCell>{item.paraDetails.issueNumber}</TableCell>
                                                <TableCell>{item.brpName}</TableCell>
                                                <TableCell>₹{item.paraDetails.amount?.toLocaleString()}</TableCell>
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" onClick={() => router.push(`/sa-reports/high-fm-para-details/edit?id=${item.id}&issueNo=${item.paraDetails.issueNumber}`)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}

