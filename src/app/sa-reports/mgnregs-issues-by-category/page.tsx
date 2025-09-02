
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
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const years = ["2022-2023", "2023-2024", "2024-2025"];

type ReportRow = {
  name: string;
  totalGps: number;
  auditedGps: number;
  fmIssues: number;
  fmAmount: number;
  fdIssues: number;
  fdAmount: number;
  pvIssues: number;
  pvAmount: number;
  grIssues: number;
  grAmount: number;
  totalIssues: number;
  totalAmount: number;
};

const ReportTable = ({ title, data, viewType }: { title: string; data: ReportRow[]; viewType: 'district' | 'block' | 'panchayat' }) => {
    const totalRow = data.reduce((acc, row) => ({
        name: 'Total',
        totalGps: acc.totalGps + row.totalGps,
        auditedGps: acc.auditedGps + row.auditedGps,
        fmIssues: acc.fmIssues + row.fmIssues,
        fmAmount: acc.fmAmount + row.fmAmount,
        fdIssues: acc.fdIssues + row.fdIssues,
        fdAmount: acc.fdAmount + row.fdAmount,
        pvIssues: acc.pvIssues + row.pvIssues,
        pvAmount: acc.pvAmount + row.pvAmount,
        grIssues: acc.grIssues + row.grIssues,
        grAmount: acc.grAmount + row.grAmount,
        totalIssues: acc.totalIssues + row.totalIssues,
        totalAmount: acc.totalAmount + row.totalAmount,
    }), { name: 'Total', totalGps: 0, auditedGps: 0, fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0, pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0, totalIssues: 0, totalAmount: 0 });

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
                <TableHead rowSpan={2}>Total Number of GPs</TableHead>
                <TableHead rowSpan={2}>Total Number of GPs audited atleast once</TableHead>
                <TableHead colSpan={2} className="text-center">Financial Misappropriation</TableHead>
                <TableHead colSpan={2} className="text-center">Financial Deviation</TableHead>
                <TableHead colSpan={2} className="text-center">Process Violation</TableHead>
                <TableHead colSpan={2} className="text-center">Grievances</TableHead>
                <TableHead colSpan={2} className="text-center">Grand Total</TableHead>
              </TableRow>
              <TableRow>
                <TableHead>Number of Issues Reported</TableHead><TableHead>Amount (Rs.)</TableHead>
                <TableHead>Number of Issues Reported</TableHead><TableHead>Amount (Rs.)</TableHead>
                <TableHead>Number of Issues Reported</TableHead><TableHead>Amount (Rs.)</TableHead>
                <TableHead>Number of Issues Reported</TableHead><TableHead>Amount (Rs.)</TableHead>
                <TableHead>Total Number of Issues Reported</TableHead><TableHead>Total Amount (Rs.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                  <TableCell>{row.fmIssues}</TableCell><TableCell>{row.fmAmount.toLocaleString()}</TableCell>
                  <TableCell>{row.fdIssues}</TableCell><TableCell>{row.fdAmount.toLocaleString()}</TableCell>
                  <TableCell>{row.pvIssues}</TableCell><TableCell>{row.pvAmount.toLocaleString()}</TableCell>
                  <TableCell>{row.grIssues}</TableCell><TableCell>{row.grAmount.toLocaleString()}</TableCell>
                  <TableCell>{row.totalIssues}</TableCell><TableCell>{row.totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
                <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2} className="text-right">Total</TableCell>
                    <TableCell>{totalRow.totalGps}</TableCell>
                    <TableCell>{totalRow.auditedGps}</TableCell>
                    <TableCell>{totalRow.fmIssues}</TableCell><TableCell>{totalRow.fmAmount.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.fdIssues}</TableCell><TableCell>{totalRow.fdAmount.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.pvIssues}</TableCell><TableCell>{totalRow.pvAmount.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.grIssues}</TableCell><TableCell>{totalRow.grAmount.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.totalIssues}</TableCell><TableCell>{totalRow.totalAmount.toLocaleString()}</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


export default function MgnregsIssuesByCategoryPage() {
    const { entries, loading } = useMgnregs();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const view = searchParams.get('view') || 'district';
    const name = searchParams.get('name');
    
    const [expenditureYear, setExpenditureYear] = useState('all');

    const reportData = useMemo(() => {
        const yearFilteredEntries = expenditureYear === 'all' 
            ? entries 
            : entries.filter(e => e.expenditureYear === expenditureYear);

        const processEntries = (geoList: string[], groupBy: 'district' | 'block' | 'panchayat') => {
            const aggregation = new Map<string, ReportRow>();
            
             // Initialize aggregation map with all geographic units
            geoList.forEach(geoName => {
                 let totalGps = 0;
                 if (groupBy === 'district') {
                    totalGps = MOCK_PANCHAYATS.filter(p => p.district === geoName).length;
                } else if (groupBy === 'block') {
                    totalGps = MOCK_PANCHAYATS.filter(p => p.block === geoName).length;
                } else if (groupBy === 'panchayat') {
                    totalGps = 1;
                }
                aggregation.set(geoName, {
                    name: geoName, totalGps: totalGps, auditedGps: 0,
                    fmIssues: 0, fmAmount: 0, fdIssues: 0, fdAmount: 0,
                    pvIssues: 0, pvAmount: 0, grIssues: 0, grAmount: 0,
                    totalIssues: 0, totalAmount: 0
                });
            });

            const auditedPanchayats = new Set<string>();

            yearFilteredEntries.forEach(entry => {
                let key;
                if(groupBy === 'panchayat') {
                    const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat);
                    key = panchayat ? panchayat.name : entry.panchayat; // Fallback to LGD code
                } else {
                    key = entry[groupBy];
                }

                if (!key || !aggregation.has(key)) return;
                
                auditedPanchayats.add(entry.panchayat);
                const current = aggregation.get(key)!;
                
                entry.paraParticulars?.forEach((para: any) => {
                    let amount = para.amount || 0;
                    current.totalIssues += 1;
                    current.totalAmount += amount;
                    if (para.type.startsWith('FM')) { current.fmIssues += 1; current.fmAmount += amount; }
                    if (para.type.startsWith('FD')) { current.fdIssues += 1; current.fdAmount += amount; }
                    if (para.type.startsWith('PV')) { current.pvIssues += 1; current.pvAmount += amount; }
                    if (para.type.startsWith('GR')) { current.grIssues += 1; current.grAmount += amount; }
                });
            });
            
             // Update auditedGps count based on unique panchayats processed for each group
            aggregation.forEach((value, key) => {
                const auditedInGroup = yearFilteredEntries.filter(e => {
                    if (groupBy === 'panchayat') {
                         const pName = MOCK_PANCHAYATS.find(p => p.lgdCode === e.panchayat)?.name || e.panchayat;
                         return pName === key;
                    }
                    return e[groupBy] === key;
                });
                value.auditedGps = new Set(auditedInGroup.map(e => e.panchayat)).size;
            });


            return Array.from(aggregation.values()).sort((a,b) => a.name.localeCompare(b.name));
        };
        
        if (view === 'district') {
            const allDistricts = uniqueDistricts.filter(d => d.toUpperCase() !== 'CHENNAI');
            return processEntries(allDistricts, 'district');
        } else if (view === 'block' && name) {
             const blocksInDistrict = Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === name).map(p => p.block)));
             return processEntries(blocksInDistrict, 'block');
        } else if (view === 'panchayat' && name) {
             const panchayatsInBlock = MOCK_PANCHAYATS.filter(p => p.block === name).map(p => p.name);
             return processEntries(panchayatsInBlock, 'panchayat');
        }
        return [];

    }, [entries, expenditureYear, view, name]);

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
                        <CardTitle>R.6.1.A.3 ISSUES REPORTED (BY CATEGORY)</CardTitle>
                        <CardDescription>A summary of social audit issues for MGNREGS, aggregated by category.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <Select value={expenditureYear} onValueChange={setExpenditureYear}>
                                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {loading ? <Loader2 className="animate-spin" /> : <ReportTable title={getTitle()} data={reportData} viewType={view as any} />}
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
