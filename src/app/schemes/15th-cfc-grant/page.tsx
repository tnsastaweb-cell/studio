
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CfcGrantSchemePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-primary">15th Central Finance Commission Grants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                <p>
                    The 15th Central Finance Commission Grants are regularly devolved to the Three Tiers of Rural local bodies, namely District Panchayat, Block Panchayat and Village Panchayat by Government of India. The Government of India has instructed that the works taken up under 15th Central Finance Commission Grants should be subjected to Social Audit.
                </p>
                <p>
                    Para 4.1 of the guidelines for Social Audit of 15th CFC Grants ‘Social Audit Unit (SAU) set up under MGNREGS Audit of Scheme Rules, 2011 shall also facilitate the Social Audit of 15th Central Finance Commission Grants’
                </p>
                 <p>
                    Para 6.1 of the guidelines for Social Audit of 15th CFC suggests ‘Expenditure towards facilitation and conduct of Social Audit shall be met by the concerned PRI being Social Audited’.
                </p>
                <p>
                    In this regard, the Government of Tamilnadu in G.O.(Ms).No.43, RD & PR (CGS.1) Dept., Dated: 07.03.2024 issued orders by nominating Social Audit Society of Tamil Nadu as Nodal Agency for the conduction of Social Audit of the works taken up under 15th Central Finance Commission and the Government have allocated a fund.
                </p>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
