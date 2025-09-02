
'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_SCHEMES } from '@/services/schemes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const mgnregsReports = {
    "R.6.1.A - SOCIAL AUDIT REPORTS": [
        { title: "R.6.1.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT", href: "/sa-reports/mgnregs-grama-panchayat-report" },
        { title: "R.6.1.A.2 INDIVIDUAL ISSUES LISTING", href: "/sa-reports/mgnregs-individual-issues-listing" },
        { title: "R.6.1.A.3 ISSUES REPORTED (BY CATEGORY)", href: "/sa-reports/mgnregs-issues-by-category" },
        { title: "R.6.1.A.4 ISSUES REPORTED (BY BRP)", href: "/sa-reports/mgnregs-issues-by-brp", disabled: false },
        { title: "R.6.1.A.5 ISSUES REPORTED (BY ROUND)", href: "/sa-reports/mgnregs-issues-by-round", disabled: false }
    ],
    "R.6.1.B - SOCIAL AUDIT FINDINGS STATUS": [
        { title: "R.6.1.B.1 FM - Financial Misappropriation", href: "#", disabled: true },
        { title: "R.6.1.B.2 FD - Financial Deviation", href: "#", disabled: true },
        { title: "R.6.1.B.3 PV - Process Violation", href: "#", disabled: true },
        { title: "R.6.1.B.4 GR – Grievances", href: "#", disabled: true }
    ],
    "R.6.1.C - ANNUAL REPORTS": [
        { title: "R.6.1.C.1 PERIODICAL REPORT", href: "#", disabled: true },
        { title: "R.6.1.C.2 CASE STUDIES", href: "/sa-reports/case-studies/view" }
    ],
    "R.6.1.D - URGENT REPORTS": [
        { title: "R.6.1.D.1 HIGH FM PARA DETAILS", href: "/sa-reports/high-fm-para-details/view" },
        { title: "R.6.1.D.2 OTHER REPORTS", href: "#", disabled: true }
    ]
};

const pmaygReports = {
    "R.6.2.A - SOCIAL AUDIT REPORTS": [
        { title: "R.6.2.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT", href: "/sa-reports/pmayg-grama-panchayat-report" },
        { title: "R.6.2.A.2 INDIVIDUAL ISSUES LISTING", href: "/sa-reports/pmayg-individual-issues-listing" },
        { title: "R.6.2.A.3 ISSUES REPORTED (BY CATEGORY)", href: "/sa-reports/pmayg-issues-by-category", disabled: false },
        { title: "R.6.2.A.4 ISSUES REPORTED (BY BRP)", href: "#", disabled: true },
        { title: "R.6.2.A.5 ISSUES REPORTED (BY ROUND)", href: "#", disabled: true }
    ],
    "R.6.2.B - SOCIAL AUDIT FINDINGS STATUS": [
        { title: "R.6.2.B.1 FM - முறைகேடு", href: "#", disabled: true },
        { title: "R.6.2.B.2 FD - செயல்முறை மீறல்", href: "#", disabled: true },
        { title: "R.6.2.B.3 PV - குறை", href: "#", disabled: true }
    ],
    "R.6.2.C - ANNUAL REPORTS": [
        { title: "R.6.2.C.1 PERIODICAL REPORT", href: "#", disabled: true },
        { title: "R.6.2.C.2 CASE STUDIES", href: "/sa-reports/case-studies/view" }
    ],
    "R.6.2.D - URGENT REPORTS": [
        { title: "R.6.2.D.1 HIGH FM PARA DETAILS", href: "#", disabled: true },
        { title: "R.6.2.D.2 OTHER REPORTS", href: "#", disabled: true }
    ]
};

const ReportCard = ({ title, reports }: { title: string; reports: {title: string, href: string, disabled?: boolean}[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {reports.map((report) => (
                    <li key={report.title}>
                        <Button variant="link" className="p-0 h-auto text-left whitespace-normal font-normal text-foreground/90" asChild disabled={report.disabled}>
                           <Link href={report.href}>{report.title}</Link>
                        </Button>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

export default function MisReportsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>MIS Reports</CardTitle>
                <CardDescription>
                    Select a scheme to view its available MIS reports.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={MOCK_SCHEMES[0].name} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                        {MOCK_SCHEMES.map(scheme => (
                           <TabsTrigger key={scheme.id} value={scheme.name} disabled={scheme.name === 'Other'}>{scheme.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <TabsContent value="MGNREGS" className="pt-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(mgnregsReports).map(([title, reports]) => (
                                <ReportCard key={title} title={title} reports={reports} />
                            ))}
                       </div>
                    </TabsContent>

                    <TabsContent value="PMAY-G" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {Object.entries(pmaygReports).map(([title, reports]) => (
                                <ReportCard key={title} title={title} reports={reports} />
                            ))}
                        </div>
                    </TabsContent>

                    {MOCK_SCHEMES.slice(2).filter(s => s.name !== 'PMAY-G').map(scheme => (
                         <TabsContent key={scheme.id} value={scheme.name} className="pt-6">
                            <div className="text-center text-muted-foreground p-8">
                                <p>Reports for {scheme.name} are currently under construction. Please check back later.</p>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
