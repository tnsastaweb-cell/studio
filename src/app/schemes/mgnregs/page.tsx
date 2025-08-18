
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";


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

const initialContent = {
    p1: "Section 17 of the Mahatma Gandhi NREGA, 2005 mandates the Gram Sabha to conduct Social Audits as under:",
    list: [
        "The Gram Sabha shall monitor the execution of works within the Gram Panchayat.",
        "The Gram Sabha shall conduct regular social audits of all the projects under the Scheme taken up within the Gram Panchayat.",
        "The Gram Panchayat shall make available all relevant documents including the muster rolls, bills, vouchers, measurement books, copies of sanction orders and other connected book of accounts and papers to the Gram Sabha for the purpose of conducting Social Audit”."
    ],
    p2: "The Central Government in consultation with the Comptroller and Auditor General of India (C & AG) notifies the Mahatma Gandhi National Rural Employment Guarantee Audit of Schemes Rules, 2011, which laid down the methodology and principles for conducting social audits in the States / UTs.",
    p3: "The Ministry has introduced Auditing Standards for Social Audit, based on recommendations of the C & AG and Joint Task Force for Social Audits, in order to strengthen the process of Social Audits and to ensure compliance of Audit of Scheme Rules, 2011. The Ministry has advised all States / UTs to adopt the Auditing Standards for the functioning of Social Audit Units and conduct of Social Audits.",
    p4: "State Governments have to identify and /or establish independent Social Audit Units (SAU), to facilitate Gram Sabha / Ward Sabha in conducting social audits of works taken up under Mahatma Gandhi NREGA within the Gram Panchayat. To this effect, State Governments are mandated to set up independent societies tasked with the exclusive responsibility of conducting social audits.",
    p5: "Accordingly, the Social Audit Unit (SAU) in Tamil Nadu has been established on 09.01.2013 and was registered under Societies Registration Act of Tamil Nadu, 1975. The Unit conducts Social Audit of Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS) in the State.",
    progressP1: "As per the MGNREGS Audit of Scheme Rules 2011, Annual Calendar for conducting Social Audit is being prepared every year and communicated to the District Collectors and Resource Persons of SASTA.",
    progressP2: "Social Audit is being conducted following the Annual Social Audit Calendar from 2015-16 onwards. Social Audit has been completed in all the Village Panchayats from 2015-16 to 2022- 23 based on the Annual Social Audit Calendar as detailed below,",
    audit2324P1: "The Government in Letter 1(D) No.29, RD and PR Dept, Dated: 31.01.2024 permitted to re-engage 14 District Resource Persons and 476 Block Resource Persons to carry out pending Social Audit, subject to the outcome of Writ Appeals filed in the Hon’ble Madras High Court.",
    audit2324P2: "Accordingly, orders were issued for engagement of 14 DRPs and 476 BRPs on 02.02.2024 and a Calendar was prepared for conduct of Social Audit for MGNREGS 2023-24 in Six rounds. Out of 12525 Village Panchayats, in 10282 Village Panchayats, audit is completed and 6th round of audit could not be completed due to enforcement of Model Code of Conduct by Election Commission of India. For 2242 Village Panchayats, Social audit will be conducted after completion of General Elections, 2024."
};


export function MgnregsSchemeContent() {
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

    const handleContentChange = (field: keyof typeof initialContent, value: string | string[]) => {
        setContent(current => ({...current, [field]: value}));
    };

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-primary">About the MGNREGS Social Audit</CardTitle>
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
                        <Textarea value={content.p1} onChange={(e) => handleContentChange('p1', e.target.value)} className="h-20" />
                        <Textarea value={content.list.join('\n')} onChange={(e) => handleContentChange('list', e.target.value.split('\n'))} className="h-40" />
                        <Textarea value={content.p2} onChange={(e) => handleContentChange('p2', e.target.value)} className="h-28" />
                        <Textarea value={content.p3} onChange={(e) => handleContentChange('p3', e.target.value)} className="h-32" />
                        <Textarea value={content.p4} onChange={(e) => handleContentChange('p4', e.target.value)} className="h-32" />
                        <Textarea value={content.p5} onChange={(e) => handleContentChange('p5', e.target.value)} className="h-28" />
                    </div>
                 ) : (
                    <>
                        <p>{content.p1}</p>
                        <ul className="list-disc pl-6 space-y-2">
                           {content.list.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                        <p>{content.p2}</p>
                        <p>{content.p3}</p>
                        <p>{content.p4}</p>
                        <p>{content.p5}</p>
                    </>
                 )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Progress made by Social Audit Society of Tamil Nadu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-normal text-foreground/90">
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea value={content.progressP1} onChange={(e) => handleContentChange('progressP1', e.target.value)} className="h-24" />
                        <Textarea value={content.progressP2} onChange={(e) => handleContentChange('progressP2', e.target.value)} className="h-24" />
                    </div>
                ) : (
                    <>
                        <p>{content.progressP1}</p>
                        <p>{content.progressP2}</p>
                    </>
                )}
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
                {isEditing ? (
                     <div className="space-y-4">
                        <Textarea value={content.audit2324P1} onChange={(e) => handleContentChange('audit2324P1', e.target.value)} className="h-28" />
                        <Textarea value={content.audit2324P2} onChange={(e) => handleContentChange('audit2324P2', e.target.value)} className="h-32" />
                    </div>
                ) : (
                    <>
                        <p>{content.audit2324P1}</p>
                        <p className="mt-2">{content.audit2324P2}</p>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
