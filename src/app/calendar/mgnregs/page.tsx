'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { MOCK_SCHEMES } from '@/services/schemes';
import { DISTRICTS } from '@/services/district-offices';

const years = ["2025-2026"];

export default function MgnregsCalendarPage() {
    const [selectedScheme, setSelectedScheme] = useState('MGNREGS');
    const [selectedYear, setSelectedYear] = useState('2025-2026');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        // In a real app, this would trigger a search/filter operation
        // based on the selected filters and search term.
        console.log({
            scheme: selectedScheme,
            year: selectedYear,
            district: selectedDistrict,
            search: searchTerm,
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>MGNREGS Audit Calendar</CardTitle>
                        <CardDescription>
                            Find and download the social audit calendars for the MGNREGS scheme.
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
                                        {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                             </div>
                        </div>

                         <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Please select filters and search to view available calendars.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}