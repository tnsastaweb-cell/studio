
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
import { useUsers, User, ROLES } from '@/services/users';
import { Loader2, Search, User as UserIcon } from 'lucide-react';
import { uniqueDistricts } from '@/lib/utils';


export default function DirectoryPage() {
  const { users, loading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.name.toLowerCase().includes(searchLower);
      const contactMatch = user.mobileNumber.includes(searchTerm);
      const roleMatch = roleFilter === 'all' || user.designation === roleFilter;
      const districtMatch = districtFilter === 'all' || user.district === districtFilter;
      
      return (nameMatch || contactMatch) && roleMatch && districtMatch;
    });
  }, [users, searchTerm, roleFilter, districtFilter]);

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
                           {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
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
                                            <p><strong className="text-muted-foreground w-24 inline-block">Employee ID</strong>: {user.employeeCode}</p>
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
