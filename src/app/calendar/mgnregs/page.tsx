
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Loader2 } from 'lucide-react';
import { MOCK_SCHEMES } from '@/services/schemes';
import { DISTRICTS } from '@/services/district-offices';
import { useCalendars } from '@/services/calendars';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const years = ["2025-2026"];

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 px-0">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function MgnregsCalendarPage() {
    const { calendars, loading: calendarsLoading } = useCalendars();
    const [selectedScheme, setSelectedScheme] = useState('MGNREGS');
    const [selectedYear, setSelectedYear] = useState('2025-2026');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCalendars = useMemo(() => {
        return calendars.filter(calendar => {
            const schemeMatch = selectedScheme ? calendar.scheme === selectedScheme : true;
            const yearMatch = selectedYear ? calendar.year === selectedYear : true;
            const districtMatch = selectedDistrict && selectedDistrict !== 'all' ? calendar.district === selectedDistrict : true;
            const searchMatch = searchTerm ? calendar.filename.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return schemeMatch && yearMatch && districtMatch && searchMatch;
        });
    }, [calendars, selectedScheme, selectedYear, selectedDistrict, searchTerm]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>MGNREGS Audit Calendar</CardTitle>
                        <CardDescription>
                            Find and view the social audit calendars for the MGNREGS scheme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Scheme</label>
                                 <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year</label>
                                 <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">District</label>
                                 <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                    <SelectTrigger><SelectValue placeholder="Select District"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by filename..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                             </div>
                        </div>

                         <div className="border rounded-lg">
                           <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">S.No</TableHead>
                                    <TableHead>Particulars</TableHead>
                                    <TableHead className="text-center w-24">View</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {calendarsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                <span>Loading Calendars...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCalendars.length > 0 ? (
                                    filteredCalendars.map((cal, index) => (
                                        <TableRow key={cal.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                <HighlightedText text={cal.filename} highlight={searchTerm} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={cal.dataUrl} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="mr-2 h-4 w-4" /> View
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                             Please select filters to view available calendars.
                                        </TableCell>
                                    </TableRow>
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
