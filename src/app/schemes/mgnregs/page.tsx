
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const auditProgressData = [
    { slNo: 1, expenditureYear: '2012-13 & 2013-14', auditTakenYear: 'Model Social Audit 2013-14 & 2014-15', villagesAudited: 127 },
    { slNo: 2, expenditureYear: '2013-14', auditTakenYear: 'Pilot Social Audit 2014-15', villagesAudited: 1140 },
    { slNo: 3, expenditureYear: '2014-15', auditTakenYear: 'Regular Social Audit 2015-16', villagesAudited: 12523 },
    { slNo: 4, expenditureYear: '2015-16', auditTakenYear: 'Regular Social Audit 2016-17', villagesAudited: 12523 },
    { slNo: 5, expenditureYear: '2016-17', auditTakenYear: 'Regular Social Audit 2017-18', villagesAudited: 12523 },
    { slNo: 6, expenditureYear: '2017-18', auditTakenYear: 'Regular Social Audit 2018-19', villagesAudited: 12523 },
    { slNo: 7, expenditureYear: '2018-19', auditTakenYear: 'Regular Social Audit 2019-20', villagesAudited: 12523 },
    { slNo: 8, expenditureYear: '2019-20', auditTakenYear: 'Regular Social Audit 2021-22', villagesAudited: 12522 },
    { slNo: 9, expenditureYear: '2020-21', auditTakenYear: '2022-23', villagesAudited: 12524 },
    { slNo: 10, expenditureYear: '2021-22', auditTakenYear: '2022-23', villagesAudited: 12524 },
    { slNo: 11, expenditureYear: '2022-23', auditTakenYear: '2023-24', villagesAudited: 10282 },
];


export default function MgnregsSchemePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-primary">Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    Section 17 of the Mahatma Gandhi NREGA, 2005 mandates the Gram Sabha to conduct Social Audits as under:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>The Gram Sabha shall monitor the execution of works within the Gram Panchayat.</li>
                    <li>The Gram Sabha shall conduct regular social audits of all the projects under the Scheme taken up within the Gram Panchayat.</li>
                    <li>The Gram Panchayat shall make available all relevant documents including the muster rolls, bills, vouchers, measurement books, copies of sanction orders and other connected book of accounts and papers to the Gram Sabha for the purpose of conducting Social Audit”.</li>
                </ul>
                <p>
                    The Central Government in consultation with the Comptroller and Auditor General of India (C & AG) notifies the Mahatma Gandhi National Rural Employment Guarantee Audit of Schemes Rules, 2011, which laid down the methodology and principles for conducting social audits in the States / UTs.
                </p>
                <p>
                    The Ministry has introduced Auditing Standards for Social Audit, based on recommendations of the C & AG and Joint Task Force for Social Audits, in order to strengthen the process of Social Audits and to ensure compliance of Audit of Scheme Rules, 2011. The Ministry has advised all States / UTs to adopt the Auditing Standards for the functioning of Social Audit Units and conduct of Social Audits.
                </p>
                <p>
                    State Governments have to identify and /or establish independent Social Audit Units (SAU), to facilitate Gram Sabha / Ward Sabha in conducting social audits of works taken up under Mahatma Gandhi NREGA within the Gram Panchayat. To this effect, State Governments are mandated to set up independent societies tasked with the exclusive responsibility of conducting social audits.
                </p>
                <p>
                    Accordingly, the Social Audit Unit (SAU) in Tamil Nadu has been established on 09.01.2013 and was registered under Societies Registration Act of Tamil Nadu, 1975. The Unit conducts Social Audit of Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS) in the State.
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Progress made by Social Audit Society of Tamil Nadu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    As per the MGNREGS Audit of Scheme Rules 2011, Annual Calendar for conducting Social Audit is being prepared every year and communicated to the District Collectors and Resource Persons of SASTA.
                </p>
                 <p>
                    Social Audit is being conducted following the Annual Social Audit Calendar from 2015-16 onwards. Social Audit has been completed in all the Village Panchayats from 2015-16 to 2022- 23 based on the Annual Social Audit Calendar as detailed below,
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl No</TableHead>
                            <TableHead>Expenditure Year</TableHead>
                            <TableHead>Audit Taken Year</TableHead>
                            <TableHead>No. of Village Panchayats Audited</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditProgressData.map((item) => (
                            <TableRow key={item.slNo}>
                                <TableCell>{item.slNo}</TableCell>
                                <TableCell>{item.expenditureYear}</TableCell>
                                <TableCell>{item.auditTakenYear}</TableCell>
                                <TableCell>{item.villagesAudited}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                 <CardTitle className="text-2xl text-primary">MGNREGS Social Audit 2023-24 (For the Expenditure Year 2022-23)</CardTitle>
            </CardHeader>
             <CardContent className="font-normal text-foreground/90">
                <p>
                    The Government in Letter 1(D) No.29, RD and PR Dept, Dated: 31.01.2024 permitted to re-engage 14 District Resource Persons and 476 Block Resource Persons to carry out pending Social Audit, subject to the outcome of Writ Appeals filed in the Hon’ble Madras High Court.
                </p>
                <p className="mt-2">
                    Accordingly, orders were issued for engagement of 14 DRPs and 476 BRPs on 02.02.2024 and a Calendar was prepared for conduct of Social Audit for MGNREGS 2023-24 in Six rounds. Out of 12525 Village Panchayats, in 10282 Village Panchayats, audit is completed and 6th round of audit could not be completed due to enforcement of Model Code of Conduct by Election Commission of India. For 2242 Village Panchayats, Social audit will be conducted after completion of General Elections, 2024.
                </p>
            </CardContent>
        </Card>

      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
