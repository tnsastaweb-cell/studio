
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const GIAInstitutionsData = [
    { no: 1, scheme: 'Model Villages under PM-AJAY', agency: 'Directorate of Rural Development and Panchayat Raj', units: 46 },
    { no: 2, scheme: 'Construction of Hostels (Babu Jagjivan Ram Chhatrawas under PM-AJAY)', agency: 'Tamil Nadu Adi Dravidar Housing and Development Corporation Ltd.', units: 5 },
    { no: 3, scheme: 'Senior Citizen Homes under AVYAY', agency: 'Commissionerate of Social Welfare', units: 9 },
    { no: 4, scheme: 'Integrated Rehabilitation Centre for Addicts (IRCA) under NAPDDR', agency: 'Directorate of Social Defense', units: 3 },
    { no: 5, scheme: 'Hostels for OBC Students under YASASVI', agency: 'Commissionerate of Most Backward Classes and Denotified Communities Welfare', units: 3 },
    { no: 6, scheme: 'Residential Schools under SHRESHTA', agency: 'Directorate of Adi Dravidar Welfare', units: 5 },
];

const sanitationWorkerDeathsData = [
    { no: 1, district: 'Chennai', deaths: 3 },
    { no: 2, district: 'Kancheepuram', deaths: 5 },
    { no: 3, district: 'Tiruvallur', deaths: 2 },
];


export default function DsjeSchemePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-primary">Social Justice - Grant-in-Aid (GIA) Institutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    The Ministry of Social Justice and Empowerment (MoSJ & E), Government of India envisaged Pilot Social Audit of Grant-in-Aid (GIA) Institutions in order to improve the monitoring of the quality of services being delivered in various schemes of the Ministry of Social Justice and Empowerment and communicated the Standard Operating Protocol (SOP) for Pilot Social Audit of GIA Institutions.
                </p>
                <p>
                    Section 4 of Standard Operating Protocol (SOP) for pilot Audit of Grant-in-Aid (GIA) Institutions, stipulates that the Social Audit Unit (SAU) functioning for the Social Audit of MGNREGS would facilitate the Social Audit of Grant-in-Aid (GIA) Institutions.
                </p>
                 <p>
                    Para 4 of the SOP for Pilot Social Audits of GIA Institutions, envisages that, ‘The Social Audit Unit identified 6 Grant-in-aid Institutions operating in the State will undergo Social Audit. The SAU will ensure that Old Age Homes, Drug-De-addiction Centres, Voluntary Organizations are adequately represented in the selection. Institutions that have been operational for more than a period of 10 years.
                </p>
                <p>
                    During the Financial Year 2023-24 in Tamil Nadu, Social Audit of 71 Units in Chennai, Vellore, Kancheepuram, Villupuram & Coimbatore Districts in respect of the six Schemes of PM-AJAY, AVYAY, IRCA under NAPDDR, YASASVI & SHRESHTA will be conducted with the support of the specifically trained Resource Persons of Social Audit Society of Tamil Nadu (SASTA).
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Name of the Scheme</TableHead>
                            <TableHead>Name of the Implementing Agency</TableHead>
                            <TableHead className="text-right">No. of Units to be Audited</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {GIAInstitutionsData.map((item) => (
                            <TableRow key={item.no}>
                                <TableCell>{item.no}</TableCell>
                                <TableCell>{item.scheme}</TableCell>
                                <TableCell>{item.agency}</TableCell>
                                <TableCell className="text-right">{item.units}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold">
                            <TableCell colSpan={3} className="text-right">Total</TableCell>
                            <TableCell className="text-right">71</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
             <CardContent className="font-normal text-foreground/90 pt-6 space-y-4">
                <p>
                    In this regard, an online orientation for State Officials and Directors of Social Audit Units (SAUs) was conducted on 09.08.2023 by the Ministry of Social Justice and Empowerment, Government of India.
                </p>
                <p>
                    Further, the Ministry of Social Justice and Empowerment has requested to conduct Social Audit of deaths of Sanitation workers, who were engaged in cleaning of Sewers and Septic tanks.
                </p>
                <p>
                    Accordingly, Social Audits on deaths of 10 Sanitation workers in three Districts of Tamil Nadu, have been conducted during the month of October 2023.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead className="text-right">No Of Deaths</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sanitationWorkerDeathsData.map((item) => (
                            <TableRow key={item.no}>
                                <TableCell>{item.no}</TableCell>
                                <TableCell>{item.district}</TableCell>
                                <TableCell className="text-right">{item.deaths}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold">
                            <TableCell colSpan={2} className="text-right">Total</TableCell>
                            <TableCell className="text-right">10</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
             <CardContent className="font-normal text-foreground/90 pt-6 space-y-4">
                <p>
                    The report of Pilot Social Audit has been handed over to the National Resource Cell for Social Audit – DoSJE, National Institute of Social Defense, Ministry of Social Justice and Empowerment, Government of India.
                </p>
                <p>
                    Social Audit Unit has proposed to conduct Social Audit of remaining 71 units in respect of 5 schemes. Regular Social Audit Calendar has been prepared and Social Audit will be conducted before August 2024.
                </p>
                <p>
                    Simultaneously, the Department of Social Welfare and Women Empowerment has been requested to designate Social Audit Unit as the Nodal Agency for conducting Social Audit of the above schemes. Orders are awaited from Social Welfare and Women Empowerment Department.
                </p>
            </CardContent>
        </Card>

      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
