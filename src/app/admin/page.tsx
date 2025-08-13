
'use client';

import { useState } from 'react';
import Link from 'next/link';

import { MOCK_USERS, User, ROLES } from '@/services/users';
import { MOCK_SCHEMES, Scheme } from '@/services/schemes';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog"


export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(true);

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header isSignedIn={isSignedIn} setIsSignedIn={setIsSignedIn} />
      <MainNavigation isSignedIn={isSignedIn} />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Panel - Master Data</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <Tabs defaultValue="signup-details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="signup-details">Sign Up Details</TabsTrigger>
                <TabsTrigger value="schemes">Schemes</TabsTrigger>
                <TabsTrigger value="panchayats">Panchayats</TabsTrigger>
            </TabsList>
            <TabsContent value="roles">
                <Card>
                    <CardHeader>
                        <CardTitle>User Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                           {ROLES.map(role => (
                                <Badge key={role} variant="secondary" className="text-lg">{role}</Badge>
                           ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="signup-details">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>S.No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Employee Code</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Mobile Number</TableHead>
                                <TableHead>Date of Birth</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>{user.id}</TableCell>
                                  <TableCell className="font-medium">{user.name}</TableCell>
                                  <TableCell>{user.employeeCode}</TableCell>
                                  <TableCell>{user.designation}</TableCell>
                                  <TableCell>{user.mobileNumber}</TableCell>
                                  <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{user.password}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                      {user.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="space-x-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">Delete</Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the user
                                            and remove their data from our servers.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                            Continue
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="schemes">
               <Card>
                    <CardHeader>
                        <CardTitle>Scheme Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Scheme</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sub Category</TableHead>
                                <TableHead>Code</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MOCK_SCHEMES.map((scheme) => (
                                <TableRow key={scheme.id}>
                                  <TableCell className="font-medium">{scheme.name}</TableCell>
                                  <TableCell>{scheme.type}</TableCell>
                                  <TableCell>{scheme.category}</TableCell>
                                  <TableCell>{scheme.subCategory}</TableCell>
                                  <TableCell>{scheme.code}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="panchayats">
                 <Card>
                    <CardHeader>
                        <CardTitle>Panchayat List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Panchayat</TableHead>
                                <TableHead>LDG Code</TableHead>
                                <TableHead>Block</TableHead>
                                <TableHead>District</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MOCK_PANCHAYATS.map((item) => (
                                <TableRow key={item.lgdCode}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.lgdCode}</TableCell>
                                  <TableCell>{item.block}</TableCell>
                                  <TableCell>{item.district}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
