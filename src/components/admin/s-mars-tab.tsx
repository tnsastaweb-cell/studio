
'use client';

import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, getDaysInMonth, getYear, setYear, getMonth, setMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Trash2 } from 'lucide-react';
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
import { useUsers } from '@/services/users';
import { useActivity } from '@/services/activity';
import { DISTRICTS } from '@/services/district-offices';
import { useToast } from '@/hooks/use-toast';

const reportYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
const reportMonths = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(0, i), 'MMMM'),
}));

export function SmarsTab() {
    const { users } = useUsers();
    const { activityLogs, clearMonthlyActivity } = useActivity();
    const { toast } = useToast();
    const [marsFilters, setMarsFilters] = useState({ search: '', district: 'all', role: 'all' });
    const [marsSelectedDate, setMarsSelectedDate] = useState(new Date());

    const marsReportData = useMemo(() => {
        const reportUsers = users.filter(u => ['BRP', 'DRP', 'DRP I/C'].includes(u.designation));

        const filteredReportUsers = reportUsers.filter(u => {
            const searchLower = marsFilters.search.toLowerCase();
            const searchMatch = marsFilters.search === '' ||
                u.name.toLowerCase().includes(searchLower) ||
                u.employeeCode.toLowerCase().includes(searchLower) ||
                u.mobileNumber.includes(searchLower);

            const districtMatch = marsFilters.district === 'all' || u.district === marsFilters.district;
            const roleMatch = marsFilters.role === 'all' || u.designation === marsFilters.role;

            return searchMatch && districtMatch && roleMatch;
        });

        const startDate = startOfMonth(marsSelectedDate);
        const endDate = endOfMonth(marsSelectedDate);

        return filteredReportUsers.map(u => {
            const userLogs = activityLogs.filter(log =>
                log.employeeCode === u.employeeCode &&
                new Date(log.timestamp) >= startDate &&
                new Date(log.timestamp) <= endDate
            );

            const dailyCounts = Array(getDaysInMonth(marsSelectedDate)).fill(0);
            userLogs.forEach(log => {
                const day = new Date(log.timestamp).getDate();
                dailyCounts[day - 1] += 1;
            });

            const total = dailyCounts.reduce((a, b) => a + b, 0);

            return { ...u, dailyCounts, total };
        });
    }, [users, activityLogs, marsFilters, marsSelectedDate]);

    const handleDownloadExcel = () => {
        const dataForSheet = marsReportData.map((u, index) => {
            const rowData: { [key: string]: any } = {
                'SL NO': index + 1,
                'ROLE': u.designation,
                'DISTRICT': u.district,
                'NAME': u.name,
                'EMPLOYEE CODE': u.employeeCode,
                'CONTACT': u.mobileNumber,
            };
            u.dailyCounts.forEach((count, i) => {
                rowData[String(i + 1).padStart(2, '0')] = count > 0 ? count : '';
            });
            rowData['MONTHLY TOTAL'] = u.total;
            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "S-MARS Report");
        XLSX.writeFile(workbook, `S-MARS-Report-${format(marsSelectedDate, 'yyyy-MM')}.xlsx`);
    };

    const handleClearData = () => {
        clearMonthlyActivity();
        toast({
            title: "Activity Data Cleared",
            description: "The activity logs for the current month have been cleared."
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>S-MARS - Smart Monthly Activity Report System</CardTitle>
                <CardDescription>Track daily activity for BRP, DRP, and DRP I/C roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 mb-4 p-4 border rounded-lg">
                    <Input placeholder="Search by Name, Code, Contact..." className="max-w-sm" value={marsFilters.search} onChange={e => setMarsFilters(f => ({ ...f, search: e.target.value }))} />
                    <Select value={marsFilters.district} onValueChange={v => setMarsFilters(f => ({ ...f, district: v }))}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={marsFilters.role} onValueChange={v => setMarsFilters(f => ({ ...f, role: v }))}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="BRP">BRP</SelectItem>
                            <SelectItem value="DRP">DRP</SelectItem>
                            <SelectItem value="DRP I/C">DRP I/C</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={getYear(marsSelectedDate).toString()} onValueChange={v => setMarsSelectedDate(setYear(marsSelectedDate, parseInt(v)))}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={getMonth(marsSelectedDate).toString()} onValueChange={v => setMarsSelectedDate(setMonth(marsSelectedDate, parseInt(v)))}>
                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {reportMonths.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="flex-grow" />
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadExcel}><Download className="mr-2" /> Download as Excel</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2" /> Clear Current Month Data</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action will permanently delete all activity logs for the current month. This cannot be undone. Are you sure you want to proceed?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearData}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className="w-full overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SL NO</TableHead>
                                <TableHead>ROLE</TableHead>
                                <TableHead>DISTRICT</TableHead>
                                <TableHead>NAME</TableHead>
                                <TableHead>EMPLOYEE CODE</TableHead>
                                <TableHead>CONTACT</TableHead>
                                {Array.from({ length: getDaysInMonth(marsSelectedDate) }, (_, i) => i + 1).map(day => (
                                    <TableHead key={day} className="text-center">{String(day).padStart(2, '0')}</TableHead>
                                ))}
                                <TableHead className="text-right">MONTHLY TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {marsReportData.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.designation}</TableCell>
                                    <TableCell>{row.district}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.employeeCode}</TableCell>
                                    <TableCell>{row.mobileNumber}</TableCell>
                                    {row.dailyCounts.map((count, dayIndex) => (
                                        <TableCell key={dayIndex} className="text-center">{count > 0 ? count : ''}</TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold">{row.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
