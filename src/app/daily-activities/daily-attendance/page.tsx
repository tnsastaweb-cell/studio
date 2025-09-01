
'use client';

import React, { useState, useMemo, FC } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, getDay, getYear, setYear, setMonth, getMonth, isSameDay, isWeekend } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { useUsers, User } from '@/services/users';
import { useAuth } from '@/hooks/use-auth';
import { useHolidays, Holiday } from '@/services/holidays';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DISTRICTS } from '@/services/district-offices';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Printer, Check, X, Circle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const reportYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());

const reportMonths = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM'),
}));

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
interface AttendanceRecord {
    [date: string]: {
        status: AttendanceStatus;
        reason?: string;
    }
}
interface StaffAttendance {
    [employeeCode: string]: AttendanceRecord;
}

export default function DailyAttendancePage() {
    const { users } = useUsers();
    const { user, loading } = useAuth();
    const { holidays } = useHolidays();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const staffForDistrict = useMemo(() => {
        if (!selectedDistrict) return [];
        return users.filter(u => {
            if (!['BRP', 'DRP', 'DRP I/C'].includes(u.designation)) return false;
            const presentStation = u.designation === 'BRP' 
                ? u.brpWorkHistory?.find(h => h.station === 'present')
                : u.drpWorkHistory?.find(h => h.station === 'present');
            return presentStation?.district === selectedDistrict;
        });
    }, [users, selectedDistrict]);

    const monthDays = useMemo(() => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);
    
    const holidaysMap = useMemo(() => {
        const map = new Map<string, string>();
        holidays.forEach(h => map.set(h.date, h.name));
        return map;
    }, [holidays]);

    const canAccessPage = user && ['DRP', 'DRP I/C', 'ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!canAccessPage) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <MainNavigation />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                <p className="mt-4">You do not have permission to view this page.</p>
                </main>
                <Footer />
                <BottomNavigation />
            </div>
        )
    }

    return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Daily Attendance</CardTitle>
                        <CardDescription>Consolidated monthly attendance view.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select onValueChange={setSelectedDistrict} value={selectedDistrict || ''}>
                           <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a District" /></SelectTrigger>
                           <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={getYear(selectedDate).toString()} onValueChange={v => setSelectedDate(setYear(selectedDate, parseInt(v)))}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={getMonth(selectedDate).toString()} onValueChange={v => setSelectedDate(setMonth(selectedDate, parseInt(v)))}>
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>{reportMonths.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="outline"><Printer className="mr-2" /> Print</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-background z-10">Sl. No</TableHead>
                                <TableHead className="sticky left-12 bg-background z-10">Name</TableHead>
                                <TableHead>Role</TableHead>
                                {monthDays.map(day => {
                                    const holiday = holidaysMap.get(format(day, 'yyyy-MM-dd'));
                                    return (
                                        <TableHead key={day.toString()} className={cn("text-center min-w-[60px]", (isWeekend(day) || holiday) && "bg-muted text-destructive")}>
                                            <div className="flex flex-col items-center">
                                                <span>{format(day, 'E', { locale: enUS }).substring(0,2)}</span>
                                                <span>{format(day, 'dd')}</span>
                                                {holiday && <span className="text-xs font-normal whitespace-nowrap">{holiday}</span>}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                                <TableHead className="text-center">Total Present</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedDistrict ? (
                                <TableRow><TableCell colSpan={36} className="text-center h-48 text-muted-foreground">Please select a district to view attendance.</TableCell></TableRow>
                            ) : staffForDistrict.length === 0 ? (
                                <TableRow><TableCell colSpan={36} className="text-center h-48 text-muted-foreground">No staff found for the selected district.</TableCell></TableRow>
                            ) : (
                                staffForDistrict.map((staff, index) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="sticky left-0 bg-background z-10">{index + 1}</TableCell>
                                        <TableCell className="sticky left-12 bg-background z-10 font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.designation}</TableCell>
                                        {monthDays.map(day => {
                                            // Placeholder logic for attendance status
                                            const status: AttendanceStatus | null = isWeekend(day) || holidaysMap.has(format(day, 'yyyy-MM-dd')) ? null : (Math.random() > 0.1 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Leave'));
                                            return (
                                                <TableCell key={day.toString()} className={cn("text-center", isWeekend(day) && "bg-muted/30")}>
                                                    {status === 'Present' && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                                                    {status === 'Absent' && <X className="h-5 w-5 text-red-500 mx-auto" />}
                                                    {status === 'Leave' && <Circle className="h-5 w-5 text-orange-500 mx-auto" />}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-center font-bold">{/* Placeholder for total */}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

