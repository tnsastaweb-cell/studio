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
import { Printer, Check, X, Circle, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const reportYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());

const reportMonths = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM'),
}));

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
interface AttendanceDay {
    status: AttendanceStatus;
    reason?: string;
    letterMailed?: boolean;
}
interface AttendanceRecord {
    [date: string]: AttendanceDay;
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
    const [attendance, setAttendance] = useState<StaffAttendance>({});

    const staffForDistrict = useMemo(() => {
        if (!selectedDistrict) return [];
        return users.filter(u => {
            if (!['BRP', 'DRP', 'DRP I/C'].includes(u.designation)) return false;
            // More robust check for present station across both BRP and DRP histories
            const presentStation = u.designation === 'BRP' 
                ? u.brpWorkHistory?.find(h => h.station === 'present')
                : (u.designation === 'DRP' || u.designation === 'DRP I/C') 
                ? u.drpWorkHistory?.find(h => h.station === 'present')
                : null;
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

    const handleAttendanceChange = (employeeCode: string, date: Date, newStatus: AttendanceStatus | null, reason?: string, letterMailed?: boolean) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        setAttendance(prev => {
            const newAttendance = { ...prev };
            if (!newAttendance[employeeCode]) newAttendance[employeeCode] = {};
            
            if (newStatus) {
                newAttendance[employeeCode][dateKey] = {
                    status: newStatus,
                    reason: reason || prev[employeeCode]?.[dateKey]?.reason || '',
                    letterMailed: letterMailed !== undefined ? letterMailed : prev[employeeCode]?.[dateKey]?.letterMailed || false,
                };
            } else {
                 delete newAttendance[employeeCode][dateKey]; // Revert to default/weekend/holiday
            }
            return newAttendance;
        });
    };

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
                                <TableHead className="sticky left-12 bg-background z-10 whitespace-nowrap">Name</TableHead>
                                <TableHead className="whitespace-nowrap">Role</TableHead>
                                {monthDays.map(day => {
                                    const holiday = holidaysMap.get(format(day, 'yyyy-MM-dd'));
                                    return (
                                        <TableHead key={day.toString()} className={cn("text-center min-w-[70px]", (isWeekend(day) || holiday) && "bg-muted text-destructive")}>
                                            <div className="flex flex-col items-center">
                                                <span>{format(day, 'E', { locale: enUS }).substring(0,2)}</span>
                                                <span>{format(day, 'dd')}</span>
                                                {holiday && <span className="text-xs font-normal whitespace-nowrap overflow-hidden text-ellipsis">{holiday}</span>}
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
                                        <TableCell className="sticky left-12 bg-background z-10 font-medium whitespace-nowrap">{staff.name}</TableCell>
                                        <TableCell>{staff.designation}</TableCell>
                                        {monthDays.map(day => {
                                            const dateKey = format(day, 'yyyy-MM-dd');
                                            const currentAttendance = attendance[staff.employeeCode]?.[dateKey];
                                            const isHoliday = holidaysMap.has(dateKey);
                                            const isSun = getDay(day) === 0;

                                            return (
                                                <TableCell key={day.toString()} className={cn("text-center", (isSun || isHoliday) && "bg-muted/30")}>
                                                     <Popover>
                                                        <PopoverTrigger asChild>
                                                            <div className="flex flex-col items-center justify-center cursor-pointer p-2 min-h-[60px]">
                                                                {currentAttendance?.status === 'Present' && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                                                                {currentAttendance?.status === 'Absent' && <X className="h-5 w-5 text-red-500 mx-auto" />}
                                                                {currentAttendance?.status === 'Leave' && <Circle className="h-5 w-5 text-orange-500 mx-auto" />}
                                                                {(!currentAttendance?.status && !isHoliday && !isSun) && <HelpCircle className="h-5 w-5 text-muted-foreground/50 mx-auto" />}

                                                                {(currentAttendance?.status === 'Absent' || currentAttendance?.status === 'Leave') && (
                                                                     <div className="flex items-center space-x-1 mt-1">
                                                                        <Checkbox 
                                                                            id={`letter-${staff.id}-${dateKey}`} 
                                                                            checked={currentAttendance.letterMailed}
                                                                            onCheckedChange={(checked) => handleAttendanceChange(staff.employeeCode, day, currentAttendance.status, currentAttendance.reason, !!checked)}
                                                                        />
                                                                        <label htmlFor={`letter-${staff.id}-${dateKey}`} className="text-xs font-light text-muted-foreground">Letter</label>
                                                                     </div>
                                                                )}
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64 space-y-4">
                                                             <h4 className="font-medium text-sm">Update Status for {format(day, 'PPP')}</h4>
                                                             <RadioGroup 
                                                                defaultValue={currentAttendance?.status} 
                                                                onValueChange={(val: AttendanceStatus) => handleAttendanceChange(staff.employeeCode, day, val, currentAttendance?.reason)}
                                                             >
                                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Present" id="p" /><Label htmlFor="p">Present</Label></div>
                                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Absent" id="a" /><Label htmlFor="a">Absent</Label></div>
                                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Leave" id="l" /><Label htmlFor="l">Leave</Label></div>
                                                             </RadioGroup>
                                                             {(currentAttendance?.status === 'Absent' || currentAttendance?.status === 'Leave') && (
                                                                <Textarea 
                                                                    placeholder="Reason for absence/leave..."
                                                                    defaultValue={currentAttendance?.reason}
                                                                    onBlur={(e) => handleAttendanceChange(staff.employeeCode, day, currentAttendance.status, e.target.value)}
                                                                />
                                                             )}
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-center font-bold">
                                             {Object.values(attendance[staff.employeeCode] || {}).filter(a => a.status === 'Present').length}
                                        </TableCell>
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