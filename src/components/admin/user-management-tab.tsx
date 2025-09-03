
'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Edit,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  X,
  Check,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUsers, ROLES, User } from '@/services/users';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  employeeCode: z.string().min(1, { message: 'Employee code is required.' }),
  designation: z.enum(ROLES),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits.' }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserManagementTab() {
    const { user } = useAuth();
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    
    const canManageUsers = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const userForm = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
          name: '',
          employeeCode: '',
          mobileNumber: '',
          password: '',
          email: '',
        },
    });

    const handleDeleteUser = (userId: number) => {
        deleteUser(userId);
        toast({
          title: 'User Deleted',
          description: 'The user has been successfully deleted.',
        });
    };
    
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        userForm.reset({
            name: user.name,
            employeeCode: user.employeeCode,
            designation: user.designation,
            mobileNumber: user.mobileNumber,
            dateOfBirth: new Date(user.dateOfBirth),
            email: user.email || '',
            password: user.password,
        });
        setIsFormOpen(true);
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        updateUser({ ...user, status: newStatus });
        toast({
            title: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
            description: `${user.name}'s account is now ${newStatus}.`,
        });
    }

    const handleAddNewUser = () => {
        setEditingUser(null);
        userForm.reset({
          name: '',
          employeeCode: '',
          designation: undefined,
          mobileNumber: '',
          dateOfBirth: undefined,
          email: '',
          password: 'password123', // Default password for new users
        });
        setIsFormOpen(true);
    };

    const onUserSubmit = (values: UserFormValues) => {
        if (editingUser) {
          updateUser({ ...editingUser, ...values, dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd') });
          toast({
            title: 'User Updated',
            description: 'The user details have been successfully updated.',
          });
        } else {
          addUser({
            ...values,
            dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
          });
          toast({
            title: 'User Added',
            description: 'The new user has been successfully created.',
          });
        }
        setIsFormOpen(false);
        setEditingUser(null);
      };

    return (
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
                                <TableHead>Email</TableHead>
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
                                    <TableCell>{format(new Date(user.dateOfBirth), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.password}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant={user.status === 'active' ? 'outline' : 'secondary'}
                                            size="sm"
                                            className="w-24"
                                            onClick={() => handleToggleStatus(user)}
                                        >
                                            {user.status === 'active' ?
                                                <><Check className="mr-2 h-4 w-4 text-green-500" /> Active</> :
                                                <><X className="mr-2 h-4 w-4 text-red-500" /> Inactive</>}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={!canManageUsers}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) { setEditingUser(null); userForm.reset(); }}}>
                    <DialogContent className="sm:max-w-[600px]">
                        <Form {...userForm}>
                            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                    <DialogDescription>{editingUser ? 'Update the details of the existing user.' : 'Fill in the details to create a new user.'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={userForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="employeeCode" render={({ field }) => (<FormItem><FormLabel>Employee Code</FormLabel><FormControl><Input placeholder="e.g., TN-123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a designation" /></SelectTrigger></FormControl><SelectContent>{ROLES.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1930-01-01')} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={userForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button></DialogClose>
                                    <Button type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
