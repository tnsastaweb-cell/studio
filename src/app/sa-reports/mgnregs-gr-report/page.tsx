
'use client';

import React, { useState, useMemo, FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMgnregs } from '@/services/mgnregs-data';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const EXPENDITURE_YEARS = ["2022-2023", "2023-2024", "2024-2025"];

type ReportRow = {
  name: string;
  totalGps: number;
  auditedGps: number;
  
  raisedIssues: number;
  raisedBeneficiaries: number;
  raisedAmount: number;

  droppedIssues: number;
  droppedBeneficiaries: number;
  droppedAmount: number;

  pendingIssues: number;
  pendingBeneficiaries: number;
  pendingAmount: number;
};

const ReportTable = ({ title, data, viewType, loading }: { title: string; data: ReportRow[]; viewType: 'district' | 'block' | 'panchayat', loading: boolean }) => {
    const totalRow = data.reduce((acc, row) => ({
        name: 'Total',
        totalGps: acc.totalGps + row.totalGps,
        auditedGps: acc.auditedGps + row.auditedGps,
        raisedIssues: acc.raisedIssues + row.raisedIssues,
        raisedBeneficiaries: acc.raisedBeneficiaries + row.raisedBeneficiaries,
        raisedAmount: acc.raisedAmount + row.raisedAmount,
        droppedIssues: acc.droppedIssues + row.droppedIssues,
        droppedBeneficiaries: acc.droppedBeneficiaries + row.droppedBeneficiaries,
        droppedAmount: acc.droppedAmount + row.droppedAmount,
        pendingIssues: acc.pendingIssues + row.pendingIssues,
        pendingBeneficiaries: acc.pendingBeneficiaries + row.pendingBeneficiaries,
        pendingAmount: acc.pendingAmount + row.pendingAmount,
    }), { 
        name: 'Total', totalGps: 0, auditedGps: 0, 
        raisedIssues: 0, raisedBeneficiaries: 0, raisedAmount: 0,
        droppedIssues: 0, droppedBeneficiaries: 0, droppedAmount: 0,
        pendingIssues: 0, pendingBeneficiaries: 0, pendingAmount: 0
    });

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2}>Sl.No</TableHead>
                <TableHead rowSpan={2}>{toTitleCase(viewType)} Name</TableHead>
                <TableHead rowSpan={2}>Total No. of GPs</TableHead>
                <TableHead rowSpan={2}>No. of Audited GPs</TableHead>
                <TableHead colSpan={3} className="text-center">Raised</TableHead>
                <TableHead colSpan={3} className="text-center">Dropped</TableHead>
                <TableHead colSpan={3} className="text-center">Pending</TableHead>
              </TableRow>
              <TableRow>
                <TableHead>No of Issues</TableHead><TableHead>No of Beneficiaries</TableHead><TableHead>Amount</TableHead>
                <TableHead>No of Issues</TableHead><TableHead>No of Beneficiaries</TableHead><TableHead>Amount</TableHead>
                <TableHead>No of Issues</TableHead><TableHead>No of Beneficiaries</TableHead><TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                  <TableRow><TableCell colSpan={13} className="h-24 text-center"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
              ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={13} className="text-center h-24">No issues found.</TableCell></TableRow>
              ) : (
                <>
                  {data.map((row, index) => (
                    <TableRow key={row.name}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {viewType !== 'panchayat' ? (
                           <Link href={`?view=${viewType === 'district' ? 'block' : 'panchayat'}&name=${row.name}`} className="text-primary hover:underline">
                            {toTitleCase(row.name)}
                           </Link>
                        ) : (
                          toTitleCase(row.name)
                        )}
                      </TableCell>
                      <TableCell>{row.totalGps}</TableCell>
                      <TableCell>{row.auditedGps}</TableCell>
                      
                      <TableCell>{row.raisedIssues}</TableCell><TableCell>{row.raisedBeneficiaries}</TableCell><TableCell>{row.raisedAmount.toLocaleString()}</TableCell>
                      <TableCell>{row.droppedIssues}</TableCell><TableCell>{row.droppedBeneficiaries}</TableCell><TableCell>{row.droppedAmount.toLocaleString()}</TableCell>
                      <TableCell>{row.pendingIssues}</TableCell><TableCell>{row.pendingBeneficiaries}</TableCell><TableCell>{row.pendingAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2} className="text-right">Total</TableCell>
                        <TableCell>{totalRow.totalGps}</TableCell>
                        <TableCell>{totalRow.auditedGps}</TableCell>
                        <TableCell>{totalRow.raisedIssues}</TableCell><TableCell>{totalRow.raisedBeneficiaries}</TableCell><TableCell>{totalRow.raisedAmount.toLocaleString()}</TableCell>
                        <TableCell>{totalRow.droppedIssues}</TableCell><TableCell>{totalRow.droppedBeneficiaries}</TableCell><TableCell>{totalRow.droppedAmount.toLocaleString()}</TableCell>
                        <TableCell>{totalRow.pendingIssues}</TableCell><TableCell>{totalRow.pendingBeneficiaries}</TableCell><TableCell>{totalRow.pendingAmount.toLocaleString()}</TableCell>
                    </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


export default function MgnregsGrReportPage() {
    const { entries, loading } = useMgnregs();
    const searchParams = useSearchParams();
    
    const view = searchParams.get('view') || 'district';
    const name = searchParams.get('name');
    
    const [expenditureYear, setExpenditureYear] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [perPage, setPerPage] = useState(10);

    const reportData = useMemo(() => {
        const yearFilteredEntries = expenditureYear === 'all'
            ? entries
            : entries.filter(e => e.expenditureYear === expenditureYear);
        
        const grEntries = yearFilteredEntries.map(entry => ({
            ...entry,
            paraParticulars: entry.paraParticulars?.filter(p => p.type === 'GR - Grievances')
        })).filter(entry => entry.paraParticulars && entry.paraParticulars.length > 0);

        const processEntries = (geoList: string[], groupBy: 'district' | 'block' | 'panchayat') => {
            const aggregation = new Map<string, ReportRow>();
            
            geoList.forEach(geoName => {
                 let totalGps = 0;
                 if (groupBy === 'district') totalGps = MOCK_PANCHAYATS.filter(p => p.district === geoName).length;
                 else if (groupBy === 'block') totalGps = MOCK_PANCHAYATS.filter(p => p.block === geoName).length;
                 else if (groupBy === 'panchayat') totalGps = 1;
                
                aggregation.set(geoName, {
                    name: geoName, totalGps, auditedGps: 0,
                    raisedIssues: 0, raisedBeneficiaries: 0, raisedAmount: 0,
                    droppedIssues: 0, droppedBeneficiaries: 0, droppedAmount: 0,
                    pendingIssues: 0, pendingBeneficiaries: 0, pendingAmount: 0
                });
            });

            grEntries.forEach(entry => {
                let key: string | undefined;
                const panchayatInfo = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat);
                
                if (groupBy === 'district') key = entry.district;
                else if (groupBy === 'block') key = entry.block;
                else if (groupBy === 'panchayat') key = panchayatInfo?.name || entry.panchayat;

                if (!key || !aggregation.has(key)) return;
                
                const current = aggregation.get(key)!;
                
                entry.paraParticulars?.forEach((para: any) => {
                    const beneficiaries = para.beneficiaries || 0;
                    const amount = para.amount || 0;
                    current.raisedIssues += 1;
                    current.raisedBeneficiaries += beneficiaries;
                    current.raisedAmount += amount;
                    
                    if (para.paraStatus === 'CLOSED') {
                        current.droppedIssues += 1;
                        current.droppedBeneficiaries += beneficiaries;
                        current.droppedAmount += amount;
                    }
                });
            });
            
            aggregation.forEach((value) => {
                const auditedInGroup = grEntries.filter(e => {
                    if (groupBy === 'panchayat') {
                         const pName = MOCK_PANCHAYATS.find(p => p.lgdCode === e.panchayat)?.name || e.panchayat;
                         return pName === value.name;
                    }
                    return e[groupBy] === value.name;
                });
                value.auditedGps = new Set(auditedInGroup.map(e => e.panchayat)).size;
                
                value.pendingIssues = value.raisedIssues - value.droppedIssues;
                value.pendingBeneficiaries = value.raisedBeneficiaries - value.droppedBeneficiaries;
                value.pendingAmount = value.raisedAmount - value.droppedAmount;
            });

            return Array.from(aggregation.values()).sort((a,b) => a.name.localeCompare(b.name));
        };
        
        let data;
        if (view === 'district') {
            const allDistricts = uniqueDistricts.filter(d => d.toUpperCase() !== 'CHENNAI');
            data = processEntries(allDistricts, 'district');
        } else if (view === 'block' && name) {
             const blocksInDistrict = Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === name).map(p => p.block)));
             data = processEntries(blocksInDistrict, 'block');
        } else if (view === 'panchayat' && name) {
             const panchayatsInBlock = MOCK_PANCHAYATS.filter(p => p.block === name).map(p => p.name);
             data = processEntries(panchayatsInBlock, 'panchayat');
        } else {
            data = [];
        }
        
        const searchLower = searchTerm.toLowerCase();
        return searchTerm ? data.filter(d => d.name.toLowerCase().includes(searchLower)) : data;

    }, [entries, expenditureYear, view, name, searchTerm]);

    const getTitle = () => {
        if (view === 'panchayat' && name) return `Panchayat-wise Report for ${toTitleCase(name)} Block`;
        if (view === 'block' && name) return `Block-wise Report for ${toTitleCase(name)} District`;
        return 'District-wise Report';
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>R.6.1.B.4 GR - Grievances</CardTitle>
                        <CardDescription>A summary of Grievance issues for MGNREGS.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <Select value={expenditureYear} onValueChange={setExpenditureYear}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Year" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {EXPENDITURE_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                             </div>
                            <Select value={perPage.toString()} onValueChange={v => setPerPage(parseInt(v))}>
                                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">Show 10</SelectItem>
                                    <SelectItem value="25">Show 25</SelectItem>
                                    <SelectItem value="50">Show 50</SelectItem>
                                    <SelectItem value="75">Show 75</SelectItem>
                                    <SelectItem value="100">Show 100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <ReportTable title={getTitle()} data={reportData} viewType={view as any} loading={loading} />
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
