
'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const governingBodyMembers = [
    { no: 1, member: 'The Additional Chief Secretary to Government, Finance Department', designation: 'Chairman' },
    { no: 2, member: 'The Additional Chief Secretary to Government / Director General, Rural Development and Panchayat Raj (Training)', designation: 'Member' },
    { no: 3, member: 'The Additional Chief Secretary / Principal Secretary / Secretary to Government, Rural Development and Panchayat Raj Department', designation: 'Member' },
    { no: 4, member: 'The Principal Accountant General / Comptroller and Auditor General', designation: 'Member' },
    { no: 5, member: 'Director, State Institute of Rural Development, Maraimalai Nagar', designation: 'Member' },
    { no: 6, member: 'Joint Secretary (NREGS) / Representative of Ministry of Rural Development, Government of India', designation: 'Member' },
    { no: 7, member: 'Managing Director, Tamil Nadu corporation for Development of Women, Chennai', designation: 'Member' },
    { no: 8, member: 'One Representative from National Institute of Rural Development, Hyderabad', designation: 'Member' },
    { no: 9, member: 'Principal of Regional Institute of Rural Development, S.V.Nagaram', designation: 'Member' },
    { no: 10, member: <>3 representatives from Civil Society Organizations, Academic and Training institutions, working in the State or outside, having long standing experience in working with issues related to transparency and public accountability. At least one of these should be a Woman member:<br/>1.Thiruporur Block Level Federation.<br/>2.Gummidipoondi Panchayat Level Federation<br/>3.Singaperumal Kovil Panchayat Level Federation</>, designation: 'Member' },
    { no: 11, member: <>Special Invitees a) Director / Commissioner of Rural Development and Panchayat Raj b) Project Director, DRDA, Kanchipuram District (Plain area District) c) Project Director, DRDA, The Nilgiris District (Hilly area district) d) Representative of Commissioner of Revenue Administration dealing with Social Security Schemes</>, designation: 'Member' },
    { no: 12, member: 'Director, Social Audit Society of Tamil Nadu, Chennai', designation: 'Secretary' },
];

const governingBodyMeetings = [
    "1st GB Minutes held on 19.02.2013",
    "2nd GB Minutes held on 23.07.2014",
    "3rd GB Minutes held on 27.07.2015",
    "4th GB Minutes held on 29.07.2016",
    "5th GB Minutes held on 20.07.2017",
    "6th GB Minutes held on 30.11.2018",
    "7th GB Minutes held on 25.02.2022",
    "8th GB Minutes held on 29.04.2024",
];


export default function GoverningBodyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Governing Body</h1>
            <p className="text-lg text-muted-foreground">Members and meeting details of the Governing Body.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Governing Body Members</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">S.No</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead>Designation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {governingBodyMembers.map((item) => (
                            <TableRow key={item.no}>
                                <TableCell>{item.no}</TableCell>
                                <TableCell className="font-normal text-foreground/90">{item.member}</TableCell>
                                <TableCell>{item.designation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
            <Card className="mt-8">
            <CardHeader>
                <CardTitle>Governing Body (GB) Meetings</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-6 space-y-2 font-normal text-foreground/90">
                    {governingBodyMeetings.map(meeting => <li key={meeting}>{meeting}</li>)}
                </ul>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
