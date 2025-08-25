
'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUsers } from '@/services/users';
import { Loader2 } from 'lucide-react';

export default function DirectoryPage() {
  const { users, loading } = useUsers();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Directory</CardTitle>
                <CardDescription>
                    Contact information for key personnel.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-4">Loading Staff...</span>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">S.No</TableHead>
                                    <TableHead>Name of the Officer</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Contact Number</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.designation}</TableCell>
                                        <TableCell>{user.mobileNumber}</TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            No staff found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
