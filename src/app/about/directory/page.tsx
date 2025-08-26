
'use client';

import React, { useState, useMemo } from 'react';
import { useUsers, User } from '@/services/users';
import { initialContacts } from '../page'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, Search, User as UserIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { cn } from '@/lib/utils';
import { DISTRICTS } from '@/services/district-offices';
import { ROLES } from '@/services/users';


// A helper type for the merged list
type DirectoryStaff = Partial<User> & {
    name: string;
    designation: string;
    employeeCode?: string;
    contactNumber?: string;
    photo?: string | null;
    district?: string;
    block?: string;
};


const toTitleCase = (str: string | undefined) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function DirectoryPage() {
    const { users, loading: usersLoading } = useUsers();

    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        district: 'all',
        employeeCode: '',
    });
     const [isEmployeeCodeOpen, setEmployeeCodeOpen] = useState(false);


    const combinedStaffList = useMemo(() => {
        if (usersLoading) return [];

        const staffMap = new Map<string, DirectoryStaff>();

        // Process registered users first
        users.forEach(user => {
            let district: string | undefined;
            const targetRoles: User['designation'][] = ['BRP', 'DRP', 'DRP I/C'];

            if (targetRoles.includes(user.designation)) {
                 if (user.designation === 'BRP' && user.brpWorkHistory?.length) {
                    const presentStation = user.brpWorkHistory.find(h => h.station === 'present');
                    district = presentStation?.district;
                } else if ((user.designation === 'DRP' || user.designation === 'DRP I/C') && user.drpWorkHistory?.length) {
                    const presentStation = user.drpWorkHistory.find(h => h.station === 'present');
                    district = presentStation?.district;
                } else {
                    district = user.district; // Fallback to base district if no history
                }
            } else {
                 district = "Chennai";
            }
            
            const presentStationForBlock = user.brpWorkHistory?.find(h => h.station === 'present');

            staffMap.set(user.employeeCode, {
                ...user,
                contactNumber: user.mobileNumber,
                photo: user.profilePicture,
                district: district || 'N/A', // Fallback
                block: user.designation === 'BRP' ? (presentStationForBlock?.block || user.block || 'N/A') : undefined,
            });
        });

        // Add static contacts only if they don't already exist in the registered list
        initialContacts.forEach(contact => {
             if (!Array.from(staffMap.values()).some(u => u.name === contact.name && u.designation === contact.role)) {
                const staticKey = `static-${contact.role.replace(/\s+/g, '')}-${contact.name}`;
                staffMap.set(staticKey, {
                    id: contact.id + 1000,
                    name: contact.name,
                    designation: contact.role,
                    contactNumber: contact.phone,
                    employeeCode: 'N/A',
                    photo: null,
                    district: "Chennai", // Static contacts are at Chennai
                });
             }
        });
        
        return Array.from(staffMap.values());

    }, [users, usersLoading]);

    const filteredStaff = useMemo(() => {
        return combinedStaffList.filter(staff => {
            const searchLower = filters.search.toLowerCase();
            const searchMatch = !filters.search ? true : (
                staff.name.toLowerCase().includes(searchLower) ||
                (staff.contactNumber && staff.contactNumber.includes(searchLower))
            );
            const roleMatch = filters.role === 'all' || staff.designation === filters.role;
            const districtMatch = filters.district === 'all' || staff.district === filters.district;
            const employeeCodeMatch = !filters.employeeCode || staff.employeeCode === filters.employeeCode;
            
            return searchMatch && roleMatch && districtMatch && employeeCodeMatch;
        });
    }, [combinedStaffList, filters]);

    const allRoles = useMemo(() => {
        const dynamicRoles = Array.from(new Set(combinedStaffList.map(s => s.designation)));
        return dynamicRoles.sort();
    }, [combinedStaffList]);
    
    const allDistricts = useMemo(() => {
         const dynamicDistricts = Array.from(new Set(combinedStaffList.map(s => s.district).filter(Boolean)));
         return ['all', ...dynamicDistricts.sort()] as string[];
    }, [combinedStaffList]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Directory</CardTitle>
                        <CardDescription>Contact information for key personnel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-card shadow-sm">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by Name, Contact..." 
                                    className="pl-10"
                                    value={filters.search}
                                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                />
                             </div>
                             <Select value={filters.role} onValueChange={v => setFilters(f => ({ ...f, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {allRoles.map(role => <SelectItem key={role} value={role}>{toTitleCase(role)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Select value={filters.district} onValueChange={v => setFilters(f => ({ ...f, district: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {allDistricts.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Districts' : toTitleCase(d)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Popover open={isEmployeeCodeOpen} onOpenChange={setEmployeeCodeOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={isEmployeeCodeOpen} className="w-full justify-between">
                                        {filters.employeeCode ? filters.employeeCode : "Select Employee Code..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Employee Code..." />
                                        <CommandEmpty>No employee found.</CommandEmpty>
                                        <CommandList>
                                             <CommandItem onSelect={() => setFilters(f => ({ ...f, employeeCode: '' }))}>Clear Filter</CommandItem>
                                            {combinedStaffList.filter(s => s.employeeCode && s.employeeCode !== 'N/A').map((staff) => (
                                                <CommandItem
                                                    key={staff.employeeCode}
                                                    value={staff.employeeCode!}
                                                    onSelect={(currentValue) => {
                                                        setFilters(f => ({ ...f, employeeCode: currentValue === f.employeeCode ? "" : currentValue}));
                                                        setEmployeeCodeOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", filters.employeeCode === staff.employeeCode ? "opacity-100" : "opacity-0")} />
                                                    {staff.employeeCode}
                                                </CommandItem>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {usersLoading ? (
                             <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStaff.map((staff, index) => (
                                    <Card key={`${staff.id}-${index}`} className="flex flex-col">
                                        <CardContent className="p-4 flex flex-grow items-start gap-4">
                                            <div className="flex-1 space-y-1 text-sm">
                                                <p><strong className="text-muted-foreground w-28 inline-block">Name</strong>: <span className="font-semibold text-primary">{staff.name}</span></p>
                                                <p><strong className="text-muted-foreground w-28 inline-block">Role</strong>: {toTitleCase(staff.designation)}</p>
                                                <p><strong className="text-muted-foreground w-28 inline-block">Employee Code</strong>: {staff.employeeCode || 'N/A'}</p>
                                                <p><strong className="text-muted-foreground w-28 inline-block">Contact No</strong>: {staff.contactNumber || 'N/A'}</p>
                                                <p><strong className="text-muted-foreground w-28 inline-block">District</strong>: {toTitleCase(staff.district)}</p>
                                                {staff.designation === 'BRP' && staff.block && (
                                                    <p><strong className="text-muted-foreground w-28 inline-block">Block</strong>: {toTitleCase(staff.block)}</p>
                                                )}
                                            </div>
                                            <Avatar className="h-24 w-24 border">
                                                <AvatarImage src={staff.photo || undefined} alt={staff.name}/>
                                                <AvatarFallback><UserIcon className="h-10 w-10 text-muted-foreground"/></AvatarFallback>
                                            </Avatar>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredStaff.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-muted-foreground">
                                        <p>No staff members found matching the current filters.</p>
                                    </div>
                                )}
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

// Dummy export to satisfy the import in other files if they use it.
export const initialPageContent = {};
