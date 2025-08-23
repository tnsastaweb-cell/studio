
'use client';

import React, { useState, useMemo, FC } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGrievances, Grievance } from '@/services/grievances';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Paperclip, Loader2, FileText, HelpCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SummaryCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
}

const SummaryCard: FC<SummaryCardProps> = ({ title, count, icon }) => (
    <Card className="shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">{count}</p>
            </div>
            {icon}
        </CardContent>
    </Card>
);

export default function GrievanceSummaryPage() {
    const { grievances, loading } = useGrievances();
    const { user, loading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    
    const canViewAdminSection = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const summaryCounts = useMemo(() => {
        return {
            total: grievances.length,
            submitted: grievances.filter(g => g.status === 'Submitted').length,
            inProgress: grievances.filter(g => g.status === 'In Progress').length,
            resolved: grievances.filter(g => g.status === 'Resolved').length,
            rejected: grievances.filter(g => g.status === 'Rejected').length,
        };
    }, [grievances]);
    
    const filteredGrievances = useMemo(() => {
        return grievances.filter(g => {
            const searchLower = searchTerm.toLowerCase();
            const statusMatch = statusFilter === 'All Statuses' ? true : g.status === statusFilter;
            const searchMatch = !searchTerm ? true : (
                g.regNo.toLowerCase().includes(searchLower) ||
                g.fromName.toLowerCase().includes(searchLower) ||
                g.subject.toLowerCase().includes(searchLower) ||
                g.contactNumber?.includes(searchLower) ||
                g.aadhaarNumber?.includes(searchLower)
            );
            return statusMatch && searchMatch;
        })
    }, [grievances, searchTerm, statusFilter]);

    const truncateText = (text: string, length: number) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Grievance Summary</CardTitle>
                        <CardDescription>
                            An overview of all submitted grievances and their current status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                           <SummaryCard title="Total Grievances" count={summaryCounts.total} icon={<FileText className="h-8 w-8 text-muted-foreground"/>} />
                           <SummaryCard title="Submitted" count={summaryCounts.submitted} icon={<HelpCircle className="h-8 w-8 text-blue-500"/>} />
                           <SummaryCard title="In-Progress" count={summaryCounts.inProgress} icon={<RefreshCw className="h-8 w-8 text-yellow-500"/>} />
                           <SummaryCard title="Resolved" count={summaryCounts.resolved} icon={<CheckCircle className="h-8 w-8 text-green-500"/>} />
                           <SummaryCard title="Rejected" count={summaryCounts.rejected} icon={<XCircle className="h-8 w-8 text-red-500"/>} />
                        </div>
                        
                        {!authLoading && canViewAdminSection && (
                            <div className="p-4 border rounded-lg bg-card space-y-4">
                               <div className="flex flex-col md:flex-row gap-4">
                                     <Input 
                                        placeholder="Search (ID, From Name, Subject, Contact, Aadhaar)" 
                                        className="flex-grow"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                     />
                                     <div className="flex gap-4">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full md:w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All Statuses">All Statuses</SelectItem>
                                                <SelectItem value="Submitted">Submitted</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Resolved">Resolved</SelectItem>
                                                <SelectItem value="Rejected">Rejected</SelectItem>
                                                <SelectItem value="Anonymous - No Reply">Anonymous - No Reply</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button className="bg-primary/90 hover:bg-primary text-primary-foreground">Export to Excel</Button>
                                     </div>
                               </div>
                                <div className="border rounded-lg mt-4">
                                   <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reg. No</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>From</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Attachment</TableHead>
                                                <TableHead>Reply</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                     <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    <div className="flex justify-center items-center">
                                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                        <span>Loading Grievances...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredGrievances.length > 0 ? (
                                            filteredGrievances.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs">{item.regNo}</TableCell>
                                                    <TableCell>{format(new Date(item.submittedAt), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell className="font-medium">{item.isAnonymous ? "Anonymous" : item.fromName}</TableCell>
                                                    <TableCell>{truncateText(item.subject, 30)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            item.status === 'Resolved' ? 'default' : 
                                                            item.status === 'Rejected' ? 'destructive' : 'secondary'
                                                        }>{item.status}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">{item.attachment && <Paperclip className="h-4 w-4 mx-auto" />}</TableCell>
                                                    <TableCell className="text-center">{item.reply && <Paperclip className="h-4 w-4 mx-auto" />}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                     No grievances found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                   </Table>
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
