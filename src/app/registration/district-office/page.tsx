
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


const PublicOfficeCard = ({ office }: { office: DistrictOffice }) => (
    <Card>
        <CardHeader>
            <CardTitle>{office.district}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
             <div className="font-normal text-foreground/90">
                <p className="font-semibold text-primary">Office Address:</p>
                <p>{office.buildingName},</p>
                <p>{office.address},</p>
                <p>{office.pincode}</p>
             </div>
             <div className="font-normal text-foreground/90">
                <p className="font-semibold text-primary">Contact:</p>
                <p>{office.contactPerson}</p>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{office.email}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{office.contactNumbers.join(', ')}</span>
                </div>
             </div>
             {office.mapsLink && (
                 <Button asChild size="sm">
                     <a href={office.mapsLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> View on Map
                     </a>
                 </Button>
             )}
        </CardContent>
    </Card>
)

export default function DistrictOfficePage() {
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Our Locations</CardTitle>
                    <CardDescription>
                        Find the contact and location details for our district offices below.
                    </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
                {officesLoading ? (
                     <div className="flex justify-center items-center h-48">
                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <span className="ml-4">Loading Offices...</span>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        {filteredOffices.length > 0 ? (
                            filteredOffices.map(office => <PublicOfficeCard key={office.id} office={office} />)
                        ) : (
                            <p className="col-span-full text-center text-muted-foreground">No offices found for the selected district.</p>
                        )}
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

