
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const executiveCommitteeMembers = [
    { member: 'Director, SASTA', designation: 'Member Secretary' },
    { member: 'Managing Director, TNCDW', designation: 'Member' },
    { member: 'Nominee of ACS, Finance', designation: 'Member' },
    { member: 'Principal Secretary, RD & PR', designation: 'Chairman' },
    { member: 'Special Invitees', designation: 'Director, Rural Development and Panchayat Raj\nDirector, Social Welfare Department\nRepresentative of Commissioner of Revenue Administration dealing with Social Security Schemes.\nProject Director, ICDS' },
];

const executiveCommitteeMeetings = [
    "1st EC Minutes held on 23.07.2014",
    "2nd EC Minutes held on 02.02.2015",
    "3rd EC Minutes held on 21.08.2017",
    "4th EC Minutes held on 16.03.2018",
    "5th EC Minutes held on 29.11.2019",
];

export default function ExecutiveCommitteePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Executive Committee</h1>
            <p className="text-lg text-muted-foreground">Roles and meeting details of the Executive Committee.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Executive Committee Members</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Designation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {executiveCommitteeMembers.map((item) => (
                            <TableRow key={item.member}>
                                <TableCell className="font-normal text-foreground/90" style={{ whiteSpace: 'pre-wrap' }}>{item.designation}</TableCell>
                                <TableCell>{item.member}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Executive Committee (EC) Meetings</CardTitle>
            </CardHeader>
            <CardContent>
                    <ul className="list-disc pl-6 space-y-2 font-normal text-foreground/90">
                    {executiveCommitteeMeetings.map(meeting => <li key={meeting}>{meeting}</li>)}
                </ul>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
