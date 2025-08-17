
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const pilotAuditData = [
    { slNo: 1, school: 'Chennai Boys Higher Secondary School, Purasawalkam, Chennai', district: 'Chennai' },
    { slNo: 2, school: 'Panchayat Union Middle School, T.Paylalam, Thalivattaram', district: 'Krishnagiri' },
    { slNo: 3, school: 'Government Higher Secondary School, Tuvakkudi', district: 'Tiruchirapalli' },
    { slNo: 4, school: 'Mariammal Girls Higher Secondary School, Mahalingapuram, Pollachi', district: 'Coimbatore' },
    { slNo: 5, school: 'Panchayat Union Middle School, Na.Muthaiyapuram, Tiruchendur Block', district: 'Tuticorin' },
];

export default function NmpSchemePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-primary">Mid Day Meal Scheme / Puratchi Thalaivar MGR Nutritious Meal Programme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    In G.O.(Ms.) No.103, Social Welfare and Noon Meal Scheme (NM 4-1) Dept, Dated 23.06.2020, the Government of Tamil Nadu issued orders appointing ‘Social Audit Society of Tamil Nadu’ as a ‘Nodal Agency’ for conducting Social Audit of Puratchi Thalaivar MGR Nutritious Meal Programme.
                </p>
                <p>
                    As directed, Pilot Social Audit have been conducted in the following 5 Nutrition Meal Programme Centres during the period from 15.11.2021 to 19.11.2021.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Pilot Social Audit Centers</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Name of the Schools / Centers</TableHead>
                            <TableHead>District</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pilotAuditData.map((item) => (
                            <TableRow key={item.slNo}>
                                <TableCell>{item.slNo}</TableCell>
                                <TableCell>{item.school}</TableCell>
                                <TableCell>{item.district}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
             <CardContent className="font-normal text-foreground/90 pt-6">
                <p>
                    The report of Pilot Social Audit has been handed over to the Director, Social Welfare and Women Empowerment Department.
                </p>
                <p className="mt-2">
                    In continuation, Social Audit Unit has proposed to conduct Social Audit of 954 Centres 2019-20 to 2021-22 before July 2024.
                </p>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
