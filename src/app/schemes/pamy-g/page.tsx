
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";

const pilotAuditData = [
    { slNo: 1, district: 'Kallakurichi', block: 'Kallakurichi', village: 'Parigam' },
    { slNo: 2, district: 'Ramanathapuram', block: 'Kamuthi', village: 'Peraiyur' },
    { slNo: 3, district: 'Salem', block: 'P.N.Palayam', village: 'C.K. Hills Vadakku Nadu' },
    { slNo: 4, district: 'Tirupathur', block: 'Tirupathur', village: 'Nellivasalnadu' },
    { slNo: 5, district: 'Vellore', block: 'Anaicut', village: 'Peenjamandai' },
];

const initialContent = {
    p1: "Section 9.6.3 of the Guidelines for Pradhan Mantri Awaas Yojana – G, stipulates that Social Audit Unit (SAU), set up by the State under MGNREGS to be roped-in, to facilitate conduct of Social Audit of PMAY-G. Resource Persons identified by the SAU at different levels may be involved with the Gram Sabhas in conducting Social Audit of PMAY (G). The Resources Persons can be drawn from primary stake-holders, Civil Society Organizations (CSO) or individuals, having knowledge and experience in working for the right of the people.",
    p2: "In G.O. (Ms) No.43, RD & PR (CGS.1) Department, dated: 08.03.2019, the Government have issued orders nominating ‘Social Audit Society of Tamil Nadu’, as ‘Nodal Agency’ for conducting Social Audit of PMAY-G.",
    p3: "Accordingly, a Pilot Social Audit of Pradhan Mantri Awaas Yojana -G, was conducted during the period from 19.09.2022 to 23.09.2022 in the following 5 Village Panchayats and Audit Reports were forwarded to the Director, Rural Development and Panchayat Raj for necessary follow-up action.",
    p4: "The report of Pilot Social Audit has been handed over to the Director, Rural Development and Panchayat Raj Department.",
    p5: "In continuation, SASTA has proposed to conduct Social Audit of the remaining 12,525 Village Panchayats for the year 2016-17 to 2021-22 before August 2024."
};


export function PmaygSchemeContent() {
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
    <div className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-primary">About the PMAY-G Social Audit</CardTitle>
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
                        <Textarea value={content.p1} onChange={(e) => handleContentChange('p1', e.target.value)} className="h-40" />
                        <Textarea value={content.p2} onChange={(e) => handleContentChange('p2', e.target.value)} className="h-24" />
                        <Textarea value={content.p3} onChange={(e) => handleContentChange('p3', e.target.value)} className="h-32" />
                    </div>
                ) : (
                    <>
                        <p>{content.p1}</p>
                        <p>{content.p2}</p>
                        <p>{content.p3}</p>
                    </>
                )}
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
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea value={content.p4} onChange={(e) => handleContentChange('p4', e.target.value)} className="h-20" />
                        <Textarea value={content.p5} onChange={(e) => handleContentChange('p5', e.target.value)} className="h-20" />
                    </div>
                ) : (
                    <>
                        <p>{content.p4}</p>
                        <p className="mt-2">{content.p5}</p>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
