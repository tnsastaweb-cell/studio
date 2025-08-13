
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";

import { MOCK_USERS, User, ROLES } from '@/services/users';
import { MOCK_SCHEMES, Scheme } from '@/services/schemes';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { cn } from "@/lib/utils";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";


const userFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    employeeCode: z.string().min(1, { message: "Employee code is required." }),
    designation: z.enum(ROLES),
    mobileNumber: z.string().regex(/^\d{10}$/, { message: "Mobile number must be 10 digits." }),
    dateOfBirth: z.date({ required_error: "Date of birth is required." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // To-do: Replace with real authentication state
  const [isSignedIn, setIsSignedIn] = useState(true);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        name: "",
        employeeCode: "",
        mobileNumber: "",
        password: "",
    },
  });

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
     toast({
      title: "User Deleted",
      description: "The user has been successfully deleted.",
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
        name: user.name,
        employeeCode: user.employeeCode,
        designation: user.designation,
        mobileNumber: user.mobileNumber,
        dateOfBirth: new Date(user.dateOfBirth),
        password: user.password,
    });
    setIsFormOpen(true);
  };

  const handleAddNewUser = () => {
    setEditingUser(null);
    form.reset({
        name: "",
        employeeCode: "",
        designation: undefined,
        mobileNumber: "",
        dateOfBirth: undefined,
        password: "password123", // Default password for new users
    });
    setIsFormOpen(true);
  }

  const onSubmit = (values: UserFormValues) => {
    if (editingUser) {
        // Update existing user
        const updatedUsers = users.map(user => 
            user.id === editingUser.id ? { ...user, ...values, dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'), status: user.status } : user
        );
        setUsers(updatedUsers);
        toast({
            title: "User Updated",
            description: "The user details have been successfully updated.",
        });
    } else {
        // Add new user
        const newUser: User = {
            id: Math.max(...users.map(u => u.id), 0) + 1, // Simple ID generation
            ...values,
            dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
            status: 'active'
        };
        setUsers([newUser, ...users]);
         toast({
            title: "User Added",
            description: "The new user has been successfully created.",
        });
    }
    setIsFormOpen(false);
    setEditingUser(null);
  }


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

         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? "Update the details of the existing user." : "Fill in the details to create a new user."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="employeeCode"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Employee Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., TN-123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Designation</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a designation" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="10-digit number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                            date > new Date() || date < new Date("1930-01-01")
                                            }
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit">{editingUser ? "Update User" : "Create User"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>


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
                         <CardDescription>
                            These are the predefined roles available across the application.
                        </CardDescription>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                Add, edit, or delete user records. Total Users: {users.length}
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddNewUser}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
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
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user, index) => (
                                <TableRow key={user.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-medium">{user.name}</TableCell>
                                  <TableCell>{user.employeeCode}</TableCell>
                                  <TableCell>{user.designation}</TableCell>
                                  <TableCell>{user.mobileNumber}</TableCell>
                                  <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">********</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                      {user.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
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
                         <CardDescription>
                            Details of all the schemes available in the application.
                        </CardDescription>
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
                         <CardDescription>
                            List of all Panchayats with their respective codes and districts.
                        </CardDescription>
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
