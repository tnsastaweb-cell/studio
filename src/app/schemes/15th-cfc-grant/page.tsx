
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";


const initialContent = {
    p1: "The 15th Central Finance Commission Grants are regularly devolved to the Three Tiers of Rural local bodies, namely District Panchayat, Block Panchayat and Village Panchayat by Government of India. The Government of India has instructed that the works taken up under 15th Central Finance Commission Grants should be subjected to Social Audit.",
    p2: "Para 4.1 of the guidelines for Social Audit of 15th CFC Grants ‘Social Audit Unit (SAU) set up under MGNREGS Audit of Scheme Rules, 2011 shall also facilitate the Social Audit of 15th Central Finance Commission Grants’",
    p3: "Para 6.1 of the guidelines for Social Audit of 15th CFC suggests ‘Expenditure towards facilitation and conduct of Social Audit shall be met by the concerned PRI being Social Audited’.",
    p4: "In this regard, the Government of Tamilnadu in G.O.(Ms).No.43, RD & PR (CGS.1) Dept., Dated: 07.03.2024 issued orders by nominating Social Audit Society of Tamil Nadu as Nodal Agency for the conduction of Social Audit of the works taken up under 15th Central Finance Commission and the Government have allocated a fund."
};


export default function CfcGrantSchemePage() {
    const { user, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);
    const { toast } = useToast();

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleSave = () => {
        setIsEditing(false);
        toast({
            title: "Saved!",
            description: "The page content has been updated.",
        });
    };

    const handleCancel = () => {
        setContent(initialContent);
        setIsEditing(false);
    };

    const handleContentChange = (field: keyof typeof initialContent, value: string) => {
        setContent(current => ({...current, [field]: value}));
    };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-3xl text-primary">15th Central Finance Commission Grants</CardTitle>
                 {!loading && canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Page</Button>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea value={content.p1} onChange={(e) => handleContentChange('p1', e.target.value)} className="h-32" />
                        <Textarea value={content.p2} onChange={(e) => handleContentChange('p2', e.target.value)} className="h-24" />
                        <Textarea value={content.p3} onChange={(e) => handleContentChange('p3', e.target.value)} className="h-24" />
                        <Textarea value={content.p4} onChange={(e) => handleContentChange('p4', e.target.value)} className="h-32" />
                    </div>
                ) : (
                    <>
                        <p>{content.p1}</p>
                        <p>{content.p2}</p>
                        <p>{content.p3}</p>
                        <p>{content.p4}</p>
                    </>
                )}
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
