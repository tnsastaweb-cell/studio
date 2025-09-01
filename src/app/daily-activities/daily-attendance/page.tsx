
'use client';

import React, { useState, useMemo, FC } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, getDay, getYear, setYear, setMonth, getMonth, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { useUsers, User } from '@/services/users';
import { useAuth } from '@/hooks/use-auth';

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
import { Printer, ChevronLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const MOCK_HOLIDAYS: { [key: string]: string } = {
    '2025-01-14': 'Pongal',
    '2025-01-15': 'Thiruvalluvar Day',
    '2025-01-16': 'Uzhavar Thirunal',
    '2025-01-26': 'Republic Day',
    '2025-08-15': 'Independence Day',
    '2025-10-02': 'Gandhi Jayanti',
};

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
        letterMailed?: boolean;
    }
}
interface StaffAttendance {
    [employeeCode: string]: AttendanceRecord;
}


const DailyAttendanceEntry = ({ district, onBack, selectedDate }: { district: string; onBack: () => void; selectedDate: Date}) => {
    const { users } = useUsers();

    const staffForDistrict = useMemo(() => {
        return users.filter(u => {
            if (!['BRP', 'DRP', 'DRP I/C'].includes(u.designation)) return false;
            const presentStation = u.designation === 'BRP' 
                ? u.brpWorkHistory?.find(h => h.station === 'present')
                : u.drpWorkHistory?.find(h => h.station === 'present');
            return presentStation?.district === district;
        });
    }, [users, district]);

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle className="text-center text-primary">Daily Attendance Entry - {district}</CardTitle>
                     <CardDescription>Date: {format(selectedDate, 'PPP')}</CardDescription>
                </div>
                 <Button variant="outline" onClick={onBack}><ChevronLeft className="mr-2"/> Back to Monthly View</Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sl. No</TableHead>
                                <TableHead>Registration No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>District / Block</TableHead>
                                <TableHead>Present</TableHead>
                                <TableHead>Absent</TableHead>
                                <TableHead>Leave</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Letter Mailed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffForDistrict.map((staff, index) => {
                                 const presentStation = staff.designation === 'BRP' 
                                    ? staff.brpWorkHistory?.find(h => h.station === 'present')
                                    : staff.drpWorkHistory?.find(h => h.station === 'present');
                                
                                return (
                                <TableRow key={staff.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{staff.employeeCode}</TableCell>
                                    <TableCell>{staff.name}</TableCell>
                                    <TableCell>{presentStation?.district}{presentStation?.block ? ` / ${presentStation.block}` : ''}</TableCell>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell><Input className="w-48" placeholder="Enter reason..." /></TableCell>
                                    <TableCell><Checkbox /></TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end mt-4">
                    <Button>Submit Attendance</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DailyAttendancePage() {
    const { users } = useUsers();
    const { user, loading } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<'monthly' | 'daily'>('monthly');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const staff = useMemo(() => {
        return users.filter(u => ['BRP', 'DRP', 'DRP I/C'].includes(u.designation));
    }, [users]);
    
    const districtData = useMemo(() => {
        const data: { [key: string]: { drpCount: number, brpCount: number } } = {};
        
        DISTRICTS.forEach(d => {
            data[d] = { drpCount: 0, brpCount: 0 };
        });

        staff.forEach(s => {
            const presentStation = s.designation === 'BRP' 
                ? s.brpWorkHistory?.find(h => h.station === 'present')
                : s.drpWorkHistory?.find(h => h.station === 'present');
            const district = presentStation?.district || s.district;
            if (district && data[district]) {
                if (s.designation === 'BRP') data[district].brpCount++;
                else data[district].drpCount++;
            }
        });
        
        return Object.entries(data).map(([district, counts]) => ({ district, ...counts }));

    }, [staff]);

    const monthDays = useMemo(() => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        return eachDayOfInterval({ start, end });
    }, [selectedDate]);

    const canAccessPage = user && ['DRP', 'DRP I/C', 'ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const handleDistrictClick = (district: string) => {
        setSelectedDistrict(district);
        setView('daily');
    };

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
        {view === 'monthly' ? (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daily Attendance</CardTitle>
                            <CardDescription>Consolidated monthly attendance view.</CardDescription>
                        </div>
                        <div className="flex gap-2">
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
                                    <TableHead>Sl. No</TableHead>
                                    <TableHead>District</TableHead>
                                    <TableHead>No. of DRPs/DRP I/C</TableHead>
                                    <TableHead>No. of BRPs</TableHead>
                                    {monthDays.map(day => {
                                        const dayOfWeek = getDay(day);
                                        const isSunday = dayOfWeek === 0;
                                        const holiday = MOCK_HOLIDAYS[format(day, 'yyyy-MM-dd')];
                                        return (
                                            <TableHead key={day.toString()} className={cn("text-center min-w-[60px]", (isSunday || holiday) && "bg-muted text-destructive")}>
                                                <div className="flex flex-col items-center">
                                                    <span>{format(day, 'E', { locale: enUS }).substring(0,2)}</span>
                                                    <span>{format(day, 'dd')}</span>
                                                    {holiday && <span className="text-xs font-normal whitespace-nowrap">{holiday}</span>}
                                                </div>
                                            </TableHead>
                                        )
                                    })}
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {districtData.map((data, index) => (
                                    <TableRow key={data.district}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Button variant="link" className="p-0 h-auto" onClick={() => handleDistrictClick(data.district)}>
                                                {data.district}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center">{data.drpCount}</TableCell>
                                        <TableCell className="text-center">{data.brpCount}</TableCell>
                                        {monthDays.map(day => {
                                            const dayOfWeek = getDay(day);
                                            const isSunday = dayOfWeek === 0;
                                            const holiday = MOCK_HOLIDAYS[format(day, 'yyyy-MM-dd')];
                                            return (
                                                <TableCell key={day.toString()} className={cn("text-center", (isSunday || holiday) && "bg-muted/50")}>
                                                    {/* Placeholder for attendance data */}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-center font-bold">{/* Placeholder for total */}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        ) : (
            selectedDistrict && <DailyAttendanceEntry district={selectedDistrict} onBack={() => setView('monthly')} selectedDate={new Date()} />
        )}
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

