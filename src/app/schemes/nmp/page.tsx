
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";

const pilotAuditData = [
    { slNo: 1, school: 'Chennai Boys Higher Secondary School, Purasawalkam, Chennai', district: 'Chennai' },
    { slNo: 2, school: 'Panchayat Union Middle School, T.Paylalam, Thalivattaram', district: 'Krishnagiri' },
    { slNo: 3, school: 'Government Higher Secondary School, Tuvakkudi', district: 'Tiruchirapalli' },
    { slNo: 4, school: 'Mariammal Girls Higher Secondary School, Mahalingapuram, Pollachi', district: 'Coimbatore' },
    { slNo: 5, school: 'Panchayat Union Middle School, Na.Muthaiyapuram, Tiruchendur Block', district: 'Tuticorin' },
];

const initialContent = {
    p1: "In G.O.(Ms.) No.103, Social Welfare and Noon Meal Scheme (NM 4-1) Dept, Dated 23.06.2020, the Government of Tamil Nadu issued orders appointing ‘Social Audit Society of Tamil Nadu’ as a ‘Nodal Agency’ for conducting Social Audit of Puratchi Thalaivar MGR Nutritious Meal Programme.",
    p2: "As directed, Pilot Social Audit have been conducted in the following 5 Nutrition Meal Programme Centres during the period from 15.11.2021 to 19.11.2021.",
    p3: "The report of Pilot Social Audit has been handed over to the Director, Social Welfare and Women Empowerment Department.",
    p4: "In continuation, Social Audit Unit has proposed to conduct Social Audit of 954 Centres 2019-20 to 2021-22 before July 2024."
};


export function NmpSchemeContent() {
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
                <CardTitle className="text-2xl text-primary">About the NMP Social Audit</CardTitle>
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
                        <Textarea value={content.p1} onChange={(e) => handleContentChange('p1', e.target.value)} className="h-28" />
                        <Textarea value={content.p2} onChange={(e) => handleContentChange('p2', e.target.value)} className="h-24" />
                    </div>
                ) : (
                     <>
                        <p>{content.p1}</p>
                        <p>{content.p2}</p>
                    </>
                )}
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
                {isEditing ? (
                    <div className="space-y-4">
                         <Textarea value={content.p3} onChange={(e) => handleContentChange('p3', e.target.value)} className="h-20" />
                         <Textarea value={content.p4} onChange={(e) => handleContentChange('p4', e.target.value)} className="h-20" />
                    </div>
                ) : (
                    <>
                        <p>{content.p3}</p>
                        <p className="mt-2">{content.p4}</p>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
