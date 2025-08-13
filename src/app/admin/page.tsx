
'use client';

import { MOCK_USERS, User } from '@/services/users';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <MainNavigation isSignedIn={isSignedIn} />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Admin Panel - User Management</h1>
            <Link href="/" className="text-sm text-primary hover:underline">
                &larr; Back to Home
            </Link>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.employeeCode}</TableCell>
                  <TableCell>{user.designation}</TableCell>
                  <TableCell>{user.mobileNumber}</TableCell>
                  <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
