
'use client';

import React, { useState, useMemo, FC, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format, parseISO } from 'date-fns';

import { MOCK_SCHEMES } from '@/services/schemes';
import { MOCK_PANCHAYATS } from '@/services/panchayats';
import { useMgnregs, MgnregsEntry } from '@/services/mgnregs-data';
import { usePmayg, PmaygEntry } from '@/services/pmayg-data';
import { usePmaygIssues, PmaygIssue } from '@/services/pmayg-issues';
import { useUsers } from '@/services/users';
import { uniqueDistricts, toTitleCase } from '@/lib/utils';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SectionCard: FC<{title: string, children: React.ReactNode, id: string}> = ({ title, children, id }) => (
    <div id={id} className="report-section mb-6 break-inside-avoid">
        <h3 className="text-lg font-bold bg-primary/10 text-primary p-2 rounded-t-md">{title}</h3>
        <div className="p-4 border border-t-0 rounded-b-md space-y-4">
            {children}
        </div>
    </div>
);

const InfoRow: FC<{label: string, value: React.ReactNode | undefined | null}> = ({ label, value }) => (
    <div className="text-sm">
        <span className="font-semibold text-foreground/80">{label}:</span>
        <span className="ml-2 font-normal text-foreground">{value || 'N/A'}</span>
    </div>
);

const MgnregsReportViewer = ({ entry }: { entry: MgnregsEntry }) => {
    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat)?.name || '';

    const summaryOfIssues = useMemo(() => {
        const summary = {
            'FM - Financial Misappropriation': { reported: 0, closed: 0 },
            'FD - Financial Deviation': { reported: 0, closed: 0 },
            'PV - Process Violation': { reported: 0, closed: 0 },
            'GR - Grievances': { reported: 0, closed: 0 },
        };

        entry.paraParticulars?.forEach(p => {
            if (p.type in summary) {
                summary[p.type as keyof typeof summary].reported += 1;
                if (p.paraStatus === 'CLOSED') {
                    summary[p.type as keyof typeof summary].closed += 1;
                }
            }
        });
        return summary;
    }, [entry.paraParticulars]);

    const summaryOfActionTaken = useMemo(() => {
         const summary = {
            fmAmount: 0,
            fmRecovered: 0,
            fdAmount: 0,
        };
        entry.paraParticulars?.forEach(p => {
            if(p.type === 'FM - Financial Misappropriation') {
                summary.fmAmount += p.amount || 0;
                summary.fmRecovered += p.recoveredAmount || 0;
            } else if (p.type === 'FD - Financial Deviation') {
                summary.fdAmount += p.amount || 0;
            }
        });
        return summary;
    }, [entry.paraParticulars]);
    

    return (
        <div className="bg-white p-8 rounded-lg shadow-md print-content font-sans text-black">
            <style>{`
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              `}</style>
            <h2 className="text-center text-xl font-bold mb-4">R.6.1.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT (MGNREGS)</h2>
            
            <SectionCard title="Social Audit Basic Information Details" id="basic-info">
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <h4 className="font-bold">Gram Panchayat Name and Dates</h4>
                        <InfoRow label="State" value="TAMIL NADU" />
                        <InfoRow label="District" value={entry.district} />
                        <InfoRow label="Block" value={entry.block} />
                        <InfoRow label="Panchayat" value={panchayatName} />
                     </div>
                      <div className="space-y-2">
                        <h4 className="font-bold">&nbsp;</h4>
                        <InfoRow label="SA Process Start Date" value={entry.auditStartDate ? format(new Date(entry.auditStartDate), 'dd/MM/yyyy') : 'N/A'} />
                        <InfoRow label="SA Process End Date" value={entry.auditEndDate ? format(new Date(entry.auditEndDate), 'dd/MM/yyyy') : 'N/A'} />
                        <InfoRow label="Gram Sabha Date" value={entry.sgsDate ? format(new Date(entry.sgsDate), 'dd/MM/yyyy') : 'N/A'} />
                     </div>
                 </div>
            </SectionCard>
            
            <SectionCard title="Records Given for Social Audit" id="records">
                 <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <InfoRow label="SA Period From Date" value={entry.expenditureYear ? format(new Date(entry.expenditureYear.split('-')[0], 3, 1), 'dd/MM/yyyy') : 'N/A'} />
                        <InfoRow label="Wage Expenditure (Unskilled + Skilled) (Rs.)" value={entry.skilledSemiSkilledAmount?.toLocaleString()} />
                        <InfoRow label="Material Expenditure (Rs.)" value={entry.materialAmount?.toLocaleString()} />
                        <InfoRow label="Total Expenditure (Rs.)" value={entry.totalAmount?.toLocaleString()} />
                      </div>
                       <div className="space-y-2">
                        <InfoRow label="SA Period To Date" value={entry.expenditureYear ? format(new Date(Number(entry.expenditureYear.split('-')[0]) + 1, 2, 31), 'dd/MM/yyyy') : 'N/A'} />
                        <InfoRow label="Total wage expenditure as given by Implementing agency (Rs.)" value={entry.skilledSemiSkilledAmount?.toLocaleString()} />
                        <InfoRow label="Total material expenditure as given by Implementing agency (Rs.)" value={entry.materialAmount?.toLocaleString()} />
                        <InfoRow label="Total expenditure as given by Implementing agency (Rs.)" value={entry.totalAmount?.toLocaleString()} />
                      </div>
                 </div>
            </SectionCard>

            <SectionCard title="Social Audit Verification Information" id="verification">
                 <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Total Number of Works" value={entry.totalWorks} />
                    <InfoRow label="Number of Works Verified" value={entry.worksVerified} />
                    <InfoRow label="Total House Holds Worked" value={entry.householdsWorked} />
                    <InfoRow label="Total House Holds Verified" value={entry.householdsVerified} />
                 </div>
            </SectionCard>

             <SectionCard title="Social Audit Grama Sabha" id="grama-sabha">
                <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Number of people participated in gram sabha" value={entry.coram} />
                    <InfoRow label="Report Upload" value={entry.reportFile && entry.reportFile.name ? <a href={URL.createObjectURL(entry.reportFile)} download={entry.reportFile.name} className="text-blue-600 hover:underline">View/Download</a> : 'Not Uploaded'} />
                    <InfoRow label="Independent Observer Name" value={entry.observerName} />
                    <InfoRow label="Independent Observer Designation" value={entry.observer === 'yes' ? 'Yes' : 'No'} />
                </div>
            </SectionCard>

             <SectionCard title="Social Audit Resource Persons who facilitated this audit" id="resource-persons">
                <Table>
                    <TableHeader><TableRow><TableHead>SR#</TableHead><TableHead>Name</TableHead><TableHead>Designation</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>1</TableCell><TableCell>{entry.brpName}</TableCell><TableCell>BRP</TableCell></TableRow>
                        {entry.vrpDetails?.map((vrp, index) => (
                             <TableRow key={index}><TableCell>{index + 2}</TableCell><TableCell>{vrp.vrpName}</TableCell><TableCell>VRP</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </SectionCard>

            <SectionCard title="Summary of Reported Issues" id="issue-summary">
                 <Table>
                    <TableHeader><TableRow>
                        <TableHead colSpan={2} className="text-center">Financial Misappropriation</TableHead>
                        <TableHead colSpan={2} className="text-center">Financial Deviation</TableHead>
                        <TableHead colSpan={2} className="text-center">Process Violation</TableHead>
                        <TableHead colSpan={2} className="text-center">Grievances</TableHead>
                         <TableHead colSpan={2} className="text-center">Total</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                         <TableRow>
                            <TableCell>No. Issues Reported</TableCell><TableCell>No. Issues Closed</TableCell>
                            <TableCell>No. Issues Reported</TableCell><TableCell>No. Issues Closed</TableCell>
                            <TableCell>No. Issues Reported</TableCell><TableCell>No. Issues Closed</TableCell>
                            <TableCell>No. Issues Reported</TableCell><TableCell>No. Issues Closed</TableCell>
                             <TableCell>Total Issues Reported</TableCell><TableCell>Total Issues Closed</TableCell>
                         </TableRow>
                         <TableRow>
                            <TableCell className="text-center">{summaryOfIssues['FM - Financial Misappropriation'].reported}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['FM - Financial Misappropriation'].closed}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['FD - Financial Deviation'].reported}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['FD - Financial Deviation'].closed}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['PV - Process Violation'].reported}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['PV - Process Violation'].closed}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['GR - Grievances'].reported}</TableCell>
                            <TableCell className="text-center">{summaryOfIssues['GR - Grievances'].closed}</TableCell>
                            <TableCell className="text-center font-bold">{Object.values(summaryOfIssues).reduce((acc, val) => acc + val.reported, 0)}</TableCell>
                            <TableCell className="text-center font-bold">{Object.values(summaryOfIssues).reduce((acc, val) => acc + val.closed, 0)}</TableCell>
                         </TableRow>
                    </TableBody>
                 </Table>
            </SectionCard>

            <SectionCard title="Summary of Action Taken Report" id="action-taken">
                 <Table>
                    <TableHeader><TableRow>
                        <TableHead>SR#</TableHead><TableHead>FM Amount</TableHead><TableHead>FM Amount recovered</TableHead><TableHead>FD Amount</TableHead>
                        <TableHead>Amount of Fine/Penalty paid</TableHead><TableHead>Number of FIRs filled</TableHead><TableHead>Number of employees suspended</TableHead>
                        <TableHead>Number of employees terminated</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>{summaryOfActionTaken.fmAmount.toLocaleString()}</TableCell>
                            <TableCell>{summaryOfActionTaken.fmRecovered.toLocaleString()}</TableCell>
                            <TableCell>{summaryOfActionTaken.fdAmount.toLocaleString()}</TableCell>
                             <TableCell>0</TableCell><TableCell>0</TableCell><TableCell>0</TableCell><TableCell>0</TableCell>
                        </TableRow>
                    </TableBody>
                 </Table>
            </SectionCard>

             <SectionCard title="Individual Issues" id="individual-issues">
                 <Table>
                    <TableHeader><TableRow>
                        <TableHead>SR#</TableHead><TableHead>Issue Number</TableHead><TableHead>Issue Type</TableHead><TableHead>Issue Description</TableHead>
                        <TableHead>Issue Amount</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {entry.paraParticulars?.map((para, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{para.issueNumber}</TableCell>
                                <TableCell>{para.type}</TableCell>
                                <TableCell>{para.subCategory}</TableCell>
                                <TableCell>{para.amount?.toLocaleString() || '0'}</TableCell>
                                <TableCell>{para.paraStatus}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             </SectionCard>

        </div>
    );
};

const PmaygReportViewer = ({ entry }: { entry: PmaygEntry }) => {
    const panchayatName = MOCK_PANCHAYATS.find(p => p.lgdCode === entry.panchayat)?.name || '';

    return (
        <div className="bg-white p-8 rounded-lg shadow-md print-content font-sans text-black">
            <style>{`
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              `}</style>
            <h2 className="text-center text-xl font-bold mb-4">R.6.2.A.1 GRAMA PANCHAYAT SOCIAL AUDIT REPORT (PMAY-G)</h2>

            <SectionCard title="Section A & B: Basic Details" id="pmayg-basic">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                    <InfoRow label="BRP Name" value={entry.brpName} />
                    <InfoRow label="BRP Employee Code" value={entry.brpEmployeeCode} />
                    <InfoRow label="District" value={entry.district} />
                    <InfoRow label="Block" value={entry.block} />
                    <InfoRow label="Panchayat" value={panchayatName} />
                    <InfoRow label="LGD Code" value={entry.lgdCode} />
                    <InfoRow label="Round No" value={entry.roundNo} />
                    <InfoRow label="SGS Date" value={entry.sgsDate ? format(new Date(entry.sgsDate), 'dd/MM/yyyy') : 'N/A'} />
                    <InfoRow label="Expenditure Year" value={entry.expenditureYear} />
                </div>
            </SectionCard>

             <SectionCard title="Section C: Verification Details" id="pmayg-verification">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                    <InfoRow label="Total Houses" value={entry.totalHouses} />
                    <InfoRow label="1st Installments" value={entry.firstInstallment} />
                    <InfoRow label="2nd Installments" value={entry.secondInstallment} />
                    <InfoRow label="3rd Installments" value={entry.thirdInstallment} />
                    <InfoRow label="4th Installments" value={entry.fourthInstallment} />
                    <InfoRow label="Not Completed After 4th" value={entry.notCompletedAfterFourth} />
                </div>
            </SectionCard>

            <SectionCard title="Section D: Panchayat Summary" id="pmayg-summary">
                 <div className="space-y-2">
                    <InfoRow label="GS Decision on New Beneficiary" value={entry.gsDecision} />
                    <div><h4 className="font-semibold text-foreground/80 mt-2">Project Deficiencies:</h4><p className="font-normal text-foreground whitespace-pre-wrap">{entry.projectDeficiencies || 'N/A'}</p></div>
                    <div><h4 className="font-semibold text-foreground/80 mt-2">Special Remarks:</h4><p className="font-normal text-foreground whitespace-pre-wrap">{entry.specialRemarks || 'N/A'}</p></div>
                    <div><h4 className="font-semibold text-foreground/80 mt-2">Outcome of Audit:</h4><p className="font-normal text-foreground whitespace-pre-wrap">{entry.auditOutcome || 'N/A'}</p></div>
                 </div>
            </SectionCard>

             <SectionCard title="Section E: Panchayat Verification Analysis" id="pmayg-analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2">A. As per MIS Report:</h4>
                        <div className="space-y-1 pl-4">
                            <InfoRow label="SECC List Count" value={entry.misSeccCount} />
                            <InfoRow label="SECC Non-Rejected" value={entry.misSeccNonRejected} />
                            <InfoRow label="SECC Selected" value={entry.misSeccSelected} />
                            <InfoRow label="Awaas+ List Count" value={entry.misAwaasPlusCount} />
                             <InfoRow label="Awaas+ Selected" value={entry.misAwaasPlusSelected} />
                             <InfoRow label="Total Selected (MIS)" value={entry.misTotalSelected} />
                        </div>
                    </div>
                    <div>
                         <h4 className="font-semibold mb-2">B. Field Verification Data:</h4>
                         <div className="space-y-1 pl-4">
                             <InfoRow label="No. of Beneficiaries Interviewed" value={entry.fieldInterviewed} />
                             <InfoRow label="Not Interviewed but House Visited" value={entry.fieldVisited} />
                             <InfoRow label="Could Not Identify" value={entry.fieldCouldNotIdentify} />
                             <InfoRow label="Total Verified (Field)" value={entry.fieldTotalVerified} />
                         </div>
                         <h4 className="font-semibold mt-4 mb-2">C. Format 3:</h4>
                         <div className="space-y-1 pl-4">
                            <InfoRow label="SECC Beneficiaries in Kutcha Houses" value={entry.format3KutchaCount} />
                         </div>
                    </div>
                </div>
            </SectionCard>
            
            <SectionCard title="Section F: Report Upload" id="pmayg-report-upload">
                <InfoRow label="Report File" value={entry.reportFile?.name ? <a href={URL.createObjectURL(entry.reportFile)} download={entry.reportFile.name} className="text-blue-600 hover:underline">View/Download</a> : 'Not Uploaded'} />
            </SectionCard>

            <SectionCard title="Section G: Para Particulars" id="pmayg-paras">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Issue No.</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sub Category</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entry.paraParticulars?.map((para: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{para.issueNumber}</TableCell>
                                    <TableCell>{para.type}</TableCell>
                                    <TableCell>{para.category}</TableCell>
                                    <TableCell className="max-w-xs">{para.subCategory}</TableCell>
                                    <TableCell>{((para.centralAmount || 0) + (para.stateAmount || 0) + (para.otherAmount || 0)).toLocaleString()}</TableCell>
                                    <TableCell>{para.paraStatus}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </SectionCard>
        </div>
    );
};


export default function GramaPanchayatSocialAuditReport() {
    const { entries: mgnregsEntries, loading: mgnregsLoading } = useMgnregs();
    const { entries: pmaygEntries, loading: pmaygLoading } = usePmayg(); 
    const printRef = useRef(null);

    const [currentScheme, setCurrentScheme] = useState('MGNREGS');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [selectedBlock, setSelectedBlock] = useState<string>('all');
    const [selectedPanchayat, setSelectedPanchayat] = useState<string>('all');
    const [selectedSgsDate, setSelectedSgsDate] = useState<string>('all');
    
    const [selectedReportEntry, setSelectedReportEntry] = useState<MgnregsEntry | PmaygEntry | null>(null);

    const blocksForDistrict = useMemo(() => {
        if (selectedDistrict === 'all') return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === selectedDistrict).map(p => p.block))).sort();
    }, [selectedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (selectedBlock === 'all') return [];
        return MOCK_PANCHAYATS.filter(p => p.block === selectedBlock).sort((a,b) => a.name.localeCompare(b.name));
    }, [selectedBlock]);

    const sgsDatesForPanchayat = useMemo(() => {
        if (selectedPanchayat === 'all') return [];
        const entries = currentScheme === 'MGNREGS' ? mgnregsEntries : pmaygEntries;
        return entries.filter((e: any) => e.panchayat === selectedPanchayat).map((e: any) => e.sgsDate);
    }, [selectedPanchayat, mgnregsEntries, pmaygEntries, currentScheme]);

    const handleGetReport = () => {
        const entries = currentScheme === 'MGNREGS' ? mgnregsEntries : pmaygEntries;
        const entry = entries.find((e: any) => 
            e.panchayat === selectedPanchayat && 
            e.sgsDate.toString() === selectedSgsDate
        );
        setSelectedReportEntry(entry || null);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `${currentScheme}_Social_Audit_Report_${selectedReportEntry?.district}`
    });
    
    const loading = mgnregsLoading || pmaygLoading;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Grama Panchayat Social Audit Report</CardTitle>
                                <CardDescription>Select filters to view a specific report.</CardDescription>
                            </div>
                             <Button onClick={handlePrint} disabled={!selectedReportEntry}>
                                <Printer className="mr-2" /> Print Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="MGNREGS" className="w-full" onValueChange={(val) => {
                            setCurrentScheme(val);
                            setSelectedReportEntry(null);
                            setSelectedDistrict('all');
                            setSelectedBlock('all');
                            setSelectedPanchayat('all');
                            setSelectedSgsDate('all');
                        }}>
                            <TabsList>
                                <TabsTrigger value="MGNREGS">MGNREGS</TabsTrigger>
                                <TabsTrigger value="PMAY-G">PMAY-G</TabsTrigger>
                            </TabsList>

                            <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end my-6">
                                <div className="space-y-2">
                                    <label>District</label>
                                    <Select value={selectedDistrict} onValueChange={v => { setSelectedDistrict(v); setSelectedBlock('all'); setSelectedPanchayat('all'); setSelectedSgsDate('all'); setSelectedReportEntry(null); }}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Districts</SelectItem>
                                            {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label>Block</label>
                                    <Select value={selectedBlock} onValueChange={v => { setSelectedBlock(v); setSelectedPanchayat('all'); setSelectedSgsDate('all'); setSelectedReportEntry(null); }} disabled={selectedDistrict === 'all'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Blocks</SelectItem>
                                            {blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label>Panchayat</label>
                                    <Select value={selectedPanchayat} onValueChange={v => { setSelectedPanchayat(v); setSelectedSgsDate('all'); setSelectedReportEntry(null); }} disabled={selectedBlock === 'all'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Panchayats</SelectItem>
                                            {panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label>SGS Date</label>
                                    <Select value={selectedSgsDate} onValueChange={v => {setSelectedSgsDate(v); setSelectedReportEntry(null); }} disabled={selectedPanchayat === 'all'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Select Date</SelectItem>
                                            {sgsDatesForPanchayat.map((d: any) => <SelectItem key={d.toString()} value={d.toString()}>{format(new Date(d), 'dd/MM/yyyy')}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleGetReport} disabled={selectedSgsDate === 'all'}>Get Report</Button>
                            </div>
                            
                            <TabsContent value="MGNREGS" className="pt-4">
                                {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                                
                                {!loading && selectedReportEntry && currentScheme === 'MGNREGS' && (
                                    <div ref={printRef}>
                                        <MgnregsReportViewer entry={selectedReportEntry as MgnregsEntry} />
                                    </div>
                                )}
                                
                                {!loading && !selectedReportEntry && (
                                     <div className="text-center p-16 text-muted-foreground">
                                        <FileText className="mx-auto h-12 w-12 mb-4" />
                                        <p>Please select your filters and click "Get Report" to view the social audit details.</p>
                                     </div>
                                )}
                            </TabsContent>
                             <TabsContent value="PMAY-G" className="pt-4">
                               {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                                
                                {!loading && selectedReportEntry && currentScheme === 'PMAY-G' && (
                                    <div ref={printRef}>
                                        <PmaygReportViewer entry={selectedReportEntry as PmaygEntry} />
                                    </div>
                                )}
                                
                                {!loading && !selectedReportEntry && (
                                     <div className="text-center p-16 text-muted-foreground">
                                        <FileText className="mx-auto h-12 w-12 mb-4" />
                                        <p>Please select your filters and click "Get Report" to view the social audit details.</p>
                                     </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
