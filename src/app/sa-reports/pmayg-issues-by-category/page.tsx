
'use client';

import React, { useState, useMemo, FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePmayg } from '@/services/pmayg-data';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const PMAYG_EXPENDITURE_YEAR = "2016-2022";

type ReportRow = {
  name: string;
  totalGps: number;
  auditedGps: number;
  misappropriationIssues: number;
  misappropriationCentral: number;
  misappropriationState: number;
  misappropriationOther: number;
  processViolationIssues: number;
  processViolationCentral: number;
  processViolationState: number;
  processViolationOther: number;
  grievanceIssues: number;
  grievanceCentral: number;
  grievanceState: number;
  grievanceOther: number;
  totalIssues: number;
  totalCentral: number;
  totalState: number;
  totalOther: number;
};

const ReportTable = ({ title, data, viewType }: { title: string; data: ReportRow[]; viewType: 'district' | 'block' | 'panchayat' }) => {
    const totalRow = data.reduce((acc, row) => ({
        name: 'Total',
        totalGps: acc.totalGps + row.totalGps,
        auditedGps: acc.auditedGps + row.auditedGps,
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
    }), { name: 'Total', totalGps: 0, auditedGps: 0, misappropriationIssues: 0, misappropriationCentral: 0, misappropriationState: 0, misappropriationOther: 0, processViolationIssues: 0, processViolationCentral: 0, processViolationState: 0, processViolationOther: 0, grievanceIssues: 0, grievanceCentral: 0, grievanceState: 0, grievanceOther: 0, totalIssues: 0, totalCentral: 0, totalState: 0, totalOther: 0 });

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2}>Sl.No</TableHead>
                <TableHead rowSpan={2}>{toTitleCase(viewType)} Name</TableHead>
                <TableHead rowSpan={2}>Total Number of GPs</TableHead>
                <TableHead rowSpan={2}>Total Number of GPs audited atleast once</TableHead>
                <TableHead colSpan={4} className="text-center">முறைகேடு</TableHead>
                <TableHead colSpan={4} className="text-center">செயல்முறை மீறல்</TableHead>
                <TableHead colSpan={4} className="text-center">குறை</TableHead>
                <TableHead colSpan={4} className="text-center">Grand Total</TableHead>
              </TableRow>
              <TableRow>
                <TableHead>No of Issues Reported</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                <TableHead>No of Issues Reported</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                <TableHead>No of Issues Reported</TableHead><TableHead>Central Amt</TableHead><TableHead>State Amt</TableHead><TableHead>Others Amt</TableHead>
                <TableHead>Total Issues Reported</TableHead><TableHead>Total Central Amt</TableHead><TableHead>Total State Amt</TableHead><TableHead>Total Others Amt</TableHead>
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
                  <TableCell>{row.misappropriationIssues}</TableCell><TableCell>{row.misappropriationCentral.toLocaleString()}</TableCell><TableCell>{row.misappropriationState.toLocaleString()}</TableCell><TableCell>{row.misappropriationOther.toLocaleString()}</TableCell>
                  <TableCell>{row.processViolationIssues}</TableCell><TableCell>{row.processViolationCentral.toLocaleString()}</TableCell><TableCell>{row.processViolationState.toLocaleString()}</TableCell><TableCell>{row.processViolationOther.toLocaleString()}</TableCell>
                  <TableCell>{row.grievanceIssues}</TableCell><TableCell>{row.grievanceCentral.toLocaleString()}</TableCell><TableCell>{row.grievanceState.toLocaleString()}</TableCell><TableCell>{row.grievanceOther.toLocaleString()}</TableCell>
                  <TableCell>{row.totalIssues}</TableCell><TableCell>{row.totalCentral.toLocaleString()}</TableCell><TableCell>{row.totalState.toLocaleString()}</TableCell><TableCell>{row.totalOther.toLocaleString()}</TableCell>
                </TableRow>
              ))}
                <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2} className="text-right">Total</TableCell>
                    <TableCell>{totalRow.totalGps}</TableCell>
                    <TableCell>{totalRow.auditedGps}</TableCell>
                    <TableCell>{totalRow.misappropriationIssues}</TableCell><TableCell>{totalRow.misappropriationCentral.toLocaleString()}</TableCell><TableCell>{totalRow.misappropriationState.toLocaleString()}</TableCell><TableCell>{totalRow.misappropriationOther.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.processViolationIssues}</TableCell><TableCell>{totalRow.processViolationCentral.toLocaleString()}</TableCell><TableCell>{totalRow.processViolationState.toLocaleString()}</TableCell><TableCell>{totalRow.processViolationOther.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.grievanceIssues}</TableCell><TableCell>{totalRow.grievanceCentral.toLocaleString()}</TableCell><TableCell>{totalRow.grievanceState.toLocaleString()}</TableCell><TableCell>{totalRow.grievanceOther.toLocaleString()}</TableCell>
                    <TableCell>{totalRow.totalIssues}</TableCell><TableCell>{totalRow.totalCentral.toLocaleString()}</TableCell><TableCell>{totalRow.totalState.toLocaleString()}</TableCell><TableCell>{totalRow.totalOther.toLocaleString()}</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


export default function PmaygIssuesByCategoryPage() {
    const { entries, loading } = usePmayg();
    const searchParams = useSearchParams();
    
    const view = searchParams.get('view') || 'district';
    const name = searchParams.get('name');

    const reportData = useMemo(() => {
        const yearFilteredEntries = entries.filter(e => e.expenditureYear === PMAYG_EXPENDITURE_YEAR);

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
                    misappropriationIssues: 0, misappropriationCentral: 0, misappropriationState: 0, misappropriationOther: 0,
                    processViolationIssues: 0, processViolationCentral: 0, processViolationState: 0, processViolationOther: 0,
                    grievanceIssues: 0, grievanceCentral: 0, grievanceState: 0, grievanceOther: 0,
                    totalIssues: 0, totalCentral: 0, totalState: 0, totalOther: 0,
                });
            });

            yearFilteredEntries.forEach(entry => {
                let key: string | undefined;
                const panchayatInfo = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat);
                
                if (groupBy === 'district') key = entry.district;
                else if (groupBy === 'block') key = entry.block;
                else if (groupBy === 'panchayat') key = panchayatInfo?.name || entry.panchayat;

                if (!key || !aggregation.has(key)) return;
                
                const current = aggregation.get(key)!;
                current.auditedGps +=1;
                
                entry.paraParticulars?.forEach((para: any) => {
                    current.totalIssues += 1;
                    current.totalCentral += para.centralAmount || 0;
                    current.totalState += para.stateAmount || 0;
                    current.totalOther += para.otherAmount || 0;

                    if (para.type === 'முறைகேடு') { 
                        current.misappropriationIssues += 1;
                        current.misappropriationCentral += para.centralAmount || 0;
                        current.misappropriationState += para.stateAmount || 0;
                        current.misappropriationOther += para.otherAmount || 0;
                    } else if (para.type === 'செயல்முறை மீறல்') {
                        current.processViolationIssues += 1;
                        current.processViolationCentral += para.centralAmount || 0;
                        current.processViolationState += para.stateAmount || 0;
                        current.processViolationOther += para.otherAmount || 0;
                    } else if (para.type === 'குறை') {
                        current.grievanceIssues += 1;
                        current.grievanceCentral += para.centralAmount || 0;
                        current.grievanceState += para.stateAmount || 0;
                        current.grievanceOther += para.otherAmount || 0;
                    }
                });
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

    }, [entries, view, name]);

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
                        <CardTitle>R.6.2.A.3 ISSUES REPORTED (BY CATEGORY) - PMAY-G</CardTitle>
                        <CardDescription>A summary of social audit issues for PMAY-G, aggregated by category for the expenditure year {PMAYG_EXPENDITURE_YEAR}.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {loading ? <Loader2 className="animate-spin" /> : <ReportTable title={getTitle()} data={reportData} viewType={view as any} />}
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
