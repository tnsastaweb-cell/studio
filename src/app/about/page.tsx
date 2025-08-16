
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { OrganizationalChart } from '@/components/organizational-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Contact {
  id: number;
  role: string;
  name: string;
  phone: string;
}

const initialContacts: Contact[] = [
    { id: 1, role: 'The Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 2, role: 'Joint Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 3, role: 'Joint Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 4, role: 'Assistant Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 5, role: 'Assistant Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 6, role: 'Consultant', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
];

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


export default function AboutUsPage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const { toast } = useToast();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
        title: "Saved!",
        description: "The contact information has been updated.",
    });
  };
  
  const handleCancel = () => {
    setContacts(initialContacts);
    setIsEditing(false);
  }

  const handleContactChange = (id: number, field: 'name' | 'phone', value: string) => {
    setContacts(currentContacts =>
      currentContacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };
  
  const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">About Us</h1>
            <p className="text-lg text-muted-foreground">Social Audit Society of Tamil Nadu (SASTA)</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="governing-body">Governing Body</TabsTrigger>
                <TabsTrigger value="executive-committee">Executive Committee</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>A Brief Overview</CardTitle></CardHeader>
                            <CardContent className="text-foreground/90 font-normal">
                                <p>The Social Audit Society of Tamil Nadu (SASTA) is a state-level autonomous institution under the Department of Rural Development and Panchayat Raj. It is dedicated to promoting transparency and accountability through community-led audits for schemes like MGNREGS and PMAY-G.</p>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader><CardTitle>Mission</CardTitle></CardHeader>
                                <CardContent className="text-foreground/90 font-normal">
                                    <p>To ensure inclusive governance by empowering communities to audit and evaluate the delivery of public schemes through participatory processes.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Vision</CardTitle></CardHeader>
                                <CardContent className="text-foreground/90 font-normal">
                                    <p>A governance ecosystem where every citizen plays a role in upholding accountability, integrity, and equitable development.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Office Address & Contact</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-foreground/90 font-normal">
                                <p><strong>Address:</strong> Panagal Maligai, Saidapet, Chennai - 600015, Tamil Nadu, India.</p>
                                <p><strong>Phone:</strong> 044-XXXX XXXX / 044-YYYY YYYY</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Emails</CardTitle></CardHeader>
                            <CardContent className="space-y-1 text-sm text-foreground/90 font-normal break-all">
                                <p>sasta.accts@gmail.com</p>
                                <p>sasta.audit@gmail.com</p>
                                <p>sadirectorate@gmail.com</p>
                                <p>sasta.report@gmail.com</p>
                                <p>sadirectorate.mis@gmail.com</p>
                                <p>sasta.accounts@gmail.com</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-primary">Structure of Social Audit Unit</h2>
                        {!loading && canEdit && (
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                        <Button onClick={handleSave}>Save Changes</Button>
                                    </>
                                ) : (
                                    <Button onClick={handleEditToggle}>Edit</Button>
                                )}
                            </div>
                        )}
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            {contacts.map(contact => (
                                <div key={contact.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <p className="font-semibold text-primary">{contact.role}</p>
                                    {isEditing ? (
                                        <>
                                            <Input value={contact.name} onChange={(e) => handleContactChange(contact.id, 'name', e.target.value)} className="font-normal" />
                                            <Input value={contact.phone} onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)} className="font-normal" />
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-normal text-foreground/90">{contact.name}</p>
                                            <p className="font-normal text-foreground/90">{contact.phone}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-primary mb-6 text-center">Organizational Structure</h2>
                    <OrganizationalChart />
                </div>
            </TabsContent>

            <TabsContent value="governing-body" className="mt-6">
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
            </TabsContent>

            <TabsContent value="executive-committee" className="mt-6">
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
            </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
