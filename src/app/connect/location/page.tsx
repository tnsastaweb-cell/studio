
'use client';

import React, { useState, useMemo } from 'react';
import { useDistrictOffices, DistrictOffice, DISTRICTS } from '@/services/district-offices';
import { Mail, Phone, ExternalLink, Loader2 } from "lucide-react";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LocationPage() {
    const { offices, loading: officesLoading } = useDistrictOffices();
    const [selectedDistrict, setSelectedDistrict] = useState('all');

    const filteredOffices = useMemo(() => {
        if (selectedDistrict === 'all') {
            return offices;
        }
        return offices.filter(office => office.district === selectedDistrict);
    }, [offices, selectedDistrict]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
         <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Our Locations</CardTitle>
                    <CardDescription>
                        Find the contact and location details for our district offices below.
                    </CardDescription>
                </div>
                 <div className="flex w-full md:w-auto gap-4">
                     <div className="w-full md:w-64">
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by District" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                {officesLoading ? (
                     <div className="flex justify-center items-center h-48">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <span className="ml-4">Loading Offices...</span>
                     </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>State/District</TableHead>
                                    <TableHead>Office Address</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">Map</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOffices.length > 0 ? (
                                    filteredOffices.map(office => (
                                       <TableRow key={office.id}>
                                            <TableCell className="font-bold text-primary">{office.district}</TableCell>
                                            <TableCell>
                                                <p className="font-normal text-foreground/90">{office.buildingName},</p>
                                                <p className="font-normal text-foreground/90">{office.address},</p>
                                                <p className="font-normal text-foreground/90">{office.pincode}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-normal text-foreground/90">{office.contactPerson}</p>
                                                <div className="flex items-center gap-2 font-normal text-foreground/90 text-sm">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{office.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-normal text-foreground/90 text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{office.contactNumbers.join(', ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {office.mapsLink && (
                                                    <Button asChild size="sm">
                                                        <a href={office.mapsLink} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> View Map
                                                        </a>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No offices found for the selected district.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
