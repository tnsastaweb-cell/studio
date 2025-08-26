
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUsers, User as StaffUser, ROLES } from '@/services/users';
import { Loader2, Search, User as UserIcon } from 'lucide-react';
import { uniqueDistricts } from '@/lib/utils';


// Simplified contact type for merging
interface MergedUser {
  id: string | number;
  name: string;
  designation: string;
  employeeCode?: string;
  mobileNumber: string;
  district?: string;
  block?: string;
  profilePicture?: string | null;
}

const whoIsWhoContacts: Omit<MergedUser, 'id'>[] = [
    { name: 'Thiru. [Name Placeholder]', designation: 'Director', mobileNumber: '044-XXXX XXXX' },
    { name: 'Thiru. [Name Placeholder]', designation: 'Joint Director', mobileNumber: '044-XXXX XXXX' },
    { name: 'Thiru. [Name Placeholder]', designation: 'Joint Director', mobileNumber: '044-XXXX XXXX' },
    { name: 'Thiru. [Name Placeholder]', designation: 'Assistant Director', mobileNumber: '044-XXXX XXXX' },
    { name: 'Thiru. [Name Placeholder]', designation: 'Assistant Director', mobileNumber: '044-XXXX XXXX' },
    { name: 'Thiru. [Name Placeholder]', designation: 'Consultant', mobileNumber: '044-XXXX XXXX' },
];


export default function DirectoryPage() {
  const { users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

 const mergedUsers = useMemo((): MergedUser[] => {
    // Process registered staff from useUsers
    const registeredStaff: MergedUser[] = users.map(user => {
      let district = user.district;
      let block = user.block;

      if (user.designation === 'BRP' && user.brpWorkHistory?.length > 0) {
        const presentStation = user.brpWorkHistory.find(h => h.station === 'present');
        if (presentStation) {
          district = presentStation.district;
          block = presentStation.block;
        }
      } else if (user.designation === 'DRP' && user.drpWorkHistory?.length > 0) {
        const presentStation = user.drpWorkHistory.find(h => h.station === 'present');
        if (presentStation) {
          district = presentStation.district;
        }
      }

      return {
        id: user.id,
        name: user.name,
        designation: user.designation,
        employeeCode: user.employeeCode,
        mobileNumber: user.mobileNumber,
        profilePicture: user.photo,
        district,
        block,
      };
    });
    
    // Process static contacts and add unique ID
    const staticContacts: MergedUser[] = whoIsWhoContacts.map((contact, index) => ({
      ...contact,
      id: `static-${index}`,
      employeeCode: 'N/A', // Placeholder
    }));
    
    // Combine and remove duplicates, giving preference to registered staff
    const combined = [...registeredStaff, ...staticContacts];
    const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
    
    return unique;

  }, [users]);
  
  
  const allRoles = useMemo(() => {
      const roles = new Set(mergedUsers.map(u => u.designation));
      return Array.from(roles).sort();
  }, [mergedUsers]);

  const filteredUsers = useMemo(() => {
    return mergedUsers.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.name.toLowerCase().includes(searchLower);
      const contactMatch = user.mobileNumber.includes(searchTerm);
      const roleMatch = roleFilter === 'all' || user.designation === roleFilter;
      const districtMatch = districtFilter === 'all' || user.district === districtFilter;
      
      return (nameMatch || contactMatch) && roleMatch && districtMatch;
    });
  }, [mergedUsers, searchTerm, roleFilter, districtFilter]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Directory</CardTitle>
                <CardDescription>
                    Contact information for key personnel. Use the filters to narrow your search.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 border rounded-lg bg-muted/50">
                   <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by Name or Contact Number..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                   </div>
                   <Select value={roleFilter} onValueChange={setRoleFilter}>
                       <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                       <SelectContent>
                           <SelectItem value="all">All Roles</SelectItem>
                           {allRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                       </SelectContent>
                   </Select>
                   <Select value={districtFilter} onValueChange={setDistrictFilter}>
                       <SelectTrigger><SelectValue placeholder="Filter by District" /></SelectTrigger>
                       <SelectContent>
                           <SelectItem value="all">All Districts</SelectItem>
                           {uniqueDistricts.map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}
                       </SelectContent>
                   </Select>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <Card key={user.id} className="shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="flex-grow space-y-1 text-sm">
                                            <p><strong className="text-muted-foreground w-24 inline-block">Name</strong>: {user.name}</p>
                                            <p><strong className="text-muted-foreground w-24 inline-block">Role</strong>: {user.designation}</p>
                                            <p><strong className="text-muted-foreground w-24 inline-block">Employee ID</strong>: {user.employeeCode || 'N/A'}</p>
                                            <p><strong className="text-muted-foreground w-24 inline-block">Contact</strong>: {user.mobileNumber}</p>
                                            {user.district && <p><strong className="text-muted-foreground w-24 inline-block">District</strong>: {user.district}</p>}
                                            {user.designation === 'BRP' && user.block && <p><strong className="text-muted-foreground w-24 inline-block">Block</strong>: {user.block}</p>}
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Avatar className="h-24 w-24 border-2 border-primary/20">
                                                <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                                                <AvatarFallback><UserIcon className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <div className="col-span-full text-center py-16">
                                <p className="text-muted-foreground">No staff members found matching your criteria.</p>
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

    