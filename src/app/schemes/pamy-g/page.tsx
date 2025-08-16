
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const pilotAuditData = [
    { slNo: 1, district: 'Kallakurichi', block: 'Kallakurichi', village: 'Parigam' },
    { slNo: 2, district: 'Ramanathapuram', block: 'Kamuthi', village: 'Peraiyur' },
    { slNo: 3, district: 'Salem', block: 'P.N.Palayam', village: 'C.K. Hills Vadakku Nadu' },
    { slNo: 4, district: 'Tirupathur', block: 'Tirupathur', village: 'Nellivasalnadu' },
    { slNo: 5, district: 'Vellore', block: 'Anaicut', village: 'Peenjamandai' },
];

export default function PmaygSchemePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-primary">Pradhan Mantri Awas Yojana (PMAY-G)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    Section 9.6.3 of the Guidelines for Pradhan Mantri Awaas Yojana – G, stipulates that Social Audit Unit (SAU), set up by the State under MGNREGS to be roped-in, to facilitate conduct of Social Audit of PMAY-G. Resource Persons identified by the SAU at different levels may be involved with the Gram Sabhas in conducting Social Audit of PMAY (G). The Resources Persons can be drawn from primary stake-holders, Civil Society Organizations (CSO) or individuals, having knowledge and experience in working for the right of the people.
                </p>
                <p>
                    In G.O. (Ms) No.43, RD & PR (CGS.1) Department, dated: 08.03.2019, the Government have issued orders nominating ‘Social Audit Society of Tamil Nadu’, as ‘Nodal Agency’ for conducting Social Audit of PMAY-G.
                </p>
                 <p>
                    Accordingly, a Pilot Social Audit of Pradhan Mantri Awaas Yojana -G, was conducted during the period from 19.09.2022 to 23.09.2022 in the following 5 Village Panchayats and Audit Reports were forwarded to the Director, Rural Development and Panchayat Raj for necessary follow-up action.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-primary">PMAY (G) – Pilot Social Audit</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl. No.</TableHead>
                            <TableHead>Name of the District</TableHead>
                            <TableHead>Name of the Block</TableHead>
                            <TableHead>Name of the Village Panchayat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pilotAuditData.map((item) => (
                            <TableRow key={item.slNo}>
                                <TableCell>{item.slNo}</TableCell>
                                <TableCell>{item.district}</TableCell>
                                <TableCell>{item.block}</TableCell>
                                <TableCell>{item.village}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
             <CardContent className="font-normal text-foreground/90 pt-6">
                <p>
                    The report of Pilot Social Audit has been handed over to the Director, Rural Development and Panchayat Raj Department.
                </p>
                <p className="mt-2">
                    In continuation, SASTA has proposed to conduct Social Audit of the remaining 12,525 Village Panchayats for the year 2016-17 to 2021-22 before August 2024.
                </p>
            </CardContent>
        </Card>

      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
