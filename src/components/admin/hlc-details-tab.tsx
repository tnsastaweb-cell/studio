
'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search, FileText, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHlc } from '@/services/hlc';
import { useAuth } from '@/hooks/use-auth';
import { MOCK_SCHEMES } from '@/services/schemes';
import { MOCK_PANCHAYATS } from '@/services/panchayats';

export function HlcDetailsTab() {
    const { user } = useAuth();
    const { hlcItems, deleteHlc } = useHlc();
    const [hlcFilters, setHlcFilters] = useState({ search: '', district: 'all' });
    
    const uniqueDistricts = useMemo(() => Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort(), []);
    const canManageHlc = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const filteredHlcItems = useMemo(() => {
        return hlcItems.filter(item => {
            const districtMatch = hlcFilters.district === 'all' || item.district === hlcFilters.district;
            const searchLower = hlcFilters.search.toLowerCase();
            const searchMatch = !searchLower ? true : (
                item.regNo.toLowerCase().includes(searchLower) ||
                item.drpName.toLowerCase().includes(searchLower) ||
                item.proceedingNo.toLowerCase().includes(searchLower)
            );
            return districtMatch && searchMatch;
        })
    }, [hlcItems, hlcFilters]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>HLC Details</CardTitle>
                <CardDescription>Review and manage all submitted HLC entries.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={MOCK_SCHEMES[0].id}>
                    <TabsList>
                        {MOCK_SCHEMES.map(scheme => (
                            <TabsTrigger key={scheme.id} value={scheme.id}>{scheme.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {MOCK_SCHEMES.map(scheme => (
                        <TabsContent key={scheme.id} value={scheme.id} className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by Reg. No, DRP Name, Proceeding No..."
                                        className="pl-10"
                                        value={hlcFilters.search}
                                        onChange={(e) => setHlcFilters(f => ({ ...f, search: e.target.value }))}
                                    />
                                </div>
                                <Select value={hlcFilters.district} onValueChange={v => setHlcFilters(f => ({ ...f, district: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reg. No</TableHead>
                                            <TableHead>HLC Date</TableHead>
                                            <TableHead>District</TableHead>
                                            <TableHead>DRP Name</TableHead>
                                            <TableHead>Placed</TableHead>
                                            <TableHead>Closed</TableHead>
                                            <TableHead>Pending</TableHead>
                                            <TableHead>Recovered</TableHead>
                                            <TableHead className="text-center">FIR</TableHead>
                                            <TableHead className="text-center">Charges</TableHead>
                                            <TableHead className="text-center">Minutes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHlcItems.filter(item => item.scheme === scheme.name).map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-xs">{item.regNo}</TableCell>
                                                <TableCell>{format(new Date(item.hlcDate), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>{item.district}</TableCell>
                                                <TableCell>{item.drpName}</TableCell>
                                                <TableCell>{item.placedParas}</TableCell>
                                                <TableCell>{item.closedParas}</TableCell>
                                                <TableCell>{item.pendingParas}</TableCell>
                                                <TableCell>{item.recoveredAmount ? `₹${item.recoveredAmount.toLocaleString()}` : '-'}</TableCell>
                                                <TableCell className="text-center">{item.firNo || 'No'}</TableCell>
                                                <TableCell className="text-center">{item.chargeDetails || 'No'}</TableCell>
                                                <TableCell className="text-center">
                                                    {item.hlcMinutes && (
                                                        <a href={item.hlcMinutes.dataUrl} download={item.hlcMinutes.name} className="text-primary hover:underline">
                                                            <FileText className="h-5 w-5 mx-auto" />
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={!canManageHlc}>Delete</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete this HLC entry.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteHlc(item.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
