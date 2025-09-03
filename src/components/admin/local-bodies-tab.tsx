
'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DISTRICTS_WITH_CODES } from '@/services/district-offices';
import { MOCK_PANCHAYATS } from '@/services/panchayats';

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export function LocalBodiesTab() {
    const [panchayatCurrentPage, setPanchayatCurrentPage] = useState(1);
    const [panchayatsPerPage, setPanchayatsPerPage] = useState(100);
    const [panchayatFilters, setPanchayatFilters] = useState({
        district: '',
        block: '',
        panchayat: '',
        lgdCode: '',
    });

    const filteredPanchayats = useMemo(() => {
        return MOCK_PANCHAYATS.filter(
            (p) =>
                p.district.toLowerCase().includes(panchayatFilters.district.toLowerCase()) &&
                p.block.toLowerCase().includes(panchayatFilters.block.toLowerCase()) &&
                p.name.toLowerCase().includes(panchayatFilters.panchayat.toLowerCase()) &&
                p.lgdCode.toString().includes(panchayatFilters.lgdCode)
        );
    }, [panchayatFilters]);

    const panchayatTotalPages = Math.ceil(filteredPanchayats.length / panchayatsPerPage);

    const paginatedPanchayats = useMemo(() => {
        const startIndex = (panchayatCurrentPage - 1) * panchayatsPerPage;
        const endIndex = startIndex + panchayatsPerPage;
        return filteredPanchayats.slice(startIndex, endIndex);
    }, [panchayatCurrentPage, panchayatsPerPage, filteredPanchayats]);

    const handlePanchayatFilterChange = (field: keyof typeof panchayatFilters, value: string) => {
        setPanchayatFilters((prev) => ({ ...prev, [field]: value }));
        setPanchayatCurrentPage(1);
    };

    const handlePanchayatsPerPageChange = (value: string) => {
        setPanchayatsPerPage(Number(value));
        setPanchayatCurrentPage(1);
    };

    const handleNextPanchayatPage = () => {
        setPanchayatCurrentPage((current) => Math.min(current + 1, panchayatTotalPages));
    };

    const handlePrevPanchayatPage = () => {
        setPanchayatCurrentPage((current) => Math.max(current - 1, 1));
    };

    return (
        <Tabs defaultValue="district-panchayats" className="w-full">
            <TabsList>
                <TabsTrigger value="district">District</TabsTrigger>
                <TabsTrigger value="panchayats">Panchayats</TabsTrigger>
                <TabsTrigger value="district-panchayats" disabled>District Panchayat</TabsTrigger>
                <TabsTrigger value="corporations" disabled>Corporation</TabsTrigger>
                <TabsTrigger value="municipalities" disabled>Municipality</TabsTrigger>
                <TabsTrigger value="town-panchayats" disabled>Town Panchayat</TabsTrigger>
            </TabsList>
            <TabsContent value="district">
                <Card>
                    <CardHeader>
                        <CardTitle>District List</CardTitle>
                        <CardDescription>List of all Districts in Tamil Nadu. Total: {DISTRICTS_WITH_CODES.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">S.No</TableHead>
                                        <TableHead>District Code</TableHead>
                                        <TableHead>District Name</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {DISTRICTS_WITH_CODES.map((district, index) => (
                                        <TableRow key={district.code}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{district.code}</TableCell>
                                            <TableCell>{toTitleCase(district.name)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="panchayats">
                <Card>
                    <CardHeader>
                        <CardTitle>Panchayat List</CardTitle>
                        <CardDescription>List of all Panchayats with their respective codes and districts. Total: {filteredPanchayats.length}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                            <Input placeholder="Filter by District..." value={panchayatFilters.district} onChange={(e) => handlePanchayatFilterChange('district', e.target.value)} />
                            <Input placeholder="Filter by Block..." value={panchayatFilters.block} onChange={(e) => handlePanchayatFilterChange('block', e.target.value)} />
                            <Input placeholder="Filter by Panchayat..." value={panchayatFilters.panchayat} onChange={(e) => handlePanchayatFilterChange('panchayat', e.target.value)} />
                            <Input placeholder="Filter by LGD Code..." value={panchayatFilters.lgdCode} onChange={(e) => handlePanchayatFilterChange('lgdCode', e.target.value)} />
                            <Button className="self-end">Get Reports</Button>
                        </div>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">S.No</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Block</TableHead>
                                        <TableHead>Panchayat</TableHead>
                                        <TableHead>LGD Code</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedPanchayats.map((item, index) => (
                                        <TableRow key={item.lgdCode}>
                                            <TableCell>{(panchayatCurrentPage - 1) * panchayatsPerPage + index + 1}</TableCell>
                                            <TableCell>{toTitleCase(item.district)}</TableCell>
                                            <TableCell>{toTitleCase(item.block)}</TableCell>
                                            <TableCell className="font-medium">{toTitleCase(item.name)}</TableCell>
                                            <TableCell>{item.lgdCode}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rows per page:</span>
                                <Select value={String(panchayatsPerPage)} onValueChange={handlePanchayatsPerPageChange}>
                                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[15, 25, 50, 75, 100].map((val) => (<SelectItem key={val} value={String(val)}>{val}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">Page {panchayatCurrentPage} of {panchayatTotalPages}</span>
                                <div className="flex gap-2">
                                    <Button onClick={handlePrevPanchayatPage} disabled={panchayatCurrentPage === 1} variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous</span></Button>
                                    <Button onClick={handleNextPanchayatPage} disabled={panchayatCurrentPage === panchayatTotalPages} variant="outline" size="sm"><span className="sr-only">Next</span><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
