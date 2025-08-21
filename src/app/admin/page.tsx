
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Eye, EyeOff, Upload, ChevronLeft, ChevronRight, FileUp } from "lucide-react";

import { useUsers, User, ROLES } from '@/services/users';
import { MOCK_SCHEMES, Scheme } from '@/services/schemes';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { DISTRICTS } from '@/services/district-offices';
import { useFeedback, Feedback } from '@/services/feedback';
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
import { useAuth } from '@/hooks/use-auth';
import { useLogo } from '@/hooks/use-logo';
import Image from 'next/image';


const userFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    employeeCode: z.string().min(1, { message: "Employee code is required." }),
    designation: z.enum(ROLES),
    mobileNumber: z.string().regex(/^\d{10}$/, { message: "Mobile number must be 10 digits." }),
    dateOfBirth: z.date({ required_error: "Date of birth is required." }),
    email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const calendarFormSchema = z.object({
    scheme: z.string().min(1, "Please select a scheme."),
    year: z.string().min(1, "Please select a year."),
    district: z.string().min(1, "Please select a district."),
    file: z.any().refine(file => file?.length == 1, "File is required."),
})

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export default function AdminPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { feedbacks } = useFeedback();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { logo, setLogo } = useLogo();
  const [logoPreview, setLogoPreview] = useState<string | null>(logo);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const calendarFileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [panchayatCurrentPage, setPanchayatCurrentPage] = useState(1);
  const [panchayatsPerPage, setPanchayatsPerPage] = useState(100);
  const [panchayatFilters, setPanchayatFilters] = useState({ district: '', block: '', panchayat: '', lgdCode: '' });

  const filteredPanchayats = useMemo(() => {
    return MOCK_PANCHAYATS.filter(p => 
        p.district.toLowerCase().includes(panchayatFilters.district.toLowerCase()) &&
        p.block.toLowerCase().includes(panchayatFilters.block.toLowerCase()) &&
        p.name.toLowerCase().includes(panchayatFilters.panchayat.toLowerCase()) &&
        p.lgdCode.toString().includes(panchayatFilters.lgdCode)
    );
  }, [panchayatFilters]);

  const panchayatTotalPages = Math.ceil(filteredPanchayats.length / panchayatsPerPage);
  
  const paginatedPanchayats = useMemo(() => {
    const startIndex = (panchayatCurrentPage - 1) * panchayatsPerPage;
    const endIndex = startIndex + panchayatsPerPage;
    return filteredPanchayats.slice(startIndex, endIndex);
  }, [panchayatCurrentPage, panchayatsPerPage, filteredPanchayats]);

  const handlePanchayatFilterChange = (field: keyof typeof panchayatFilters, value: string) => {
    setPanchayatFilters(prev => ({...prev, [field]: value}));
    setPanchayatCurrentPage(1);
  }
  
  const handlePanchayatsPerPageChange = (value: string) => {
    setPanchayatsPerPage(Number(value));
    setPanchayatCurrentPage(1);
  }

  const handleNextPanchayatPage = () => {
    setPanchayatCurrentPage(current => Math.min(current + 1, panchayatTotalPages));
  }
  
  const handlePrevPanchayatPage = () => {
    setPanchayatCurrentPage(current => Math.max(current - 1, 1));
  }
  
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        name: "",
        employeeCode: "",
        mobileNumber: "",
        password: "",
        email: "",
    },
  });

  const calendarForm = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: {
        year: "2025-2026",
    }
  })

  const handleDeleteUser = (userId: number) => {
    deleteUser(userId);
     toast({
      title: "User Deleted",
      description: "The user has been successfully deleted.",
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
        email: user.email || "",
        password: user.password,
    });
    setIsFormOpen(true);
  };

  const handleAddNewUser = () => {
    setEditingUser(null);
    userForm.reset({
        name: "",
        employeeCode: "",
        designation: undefined,
        mobileNumber: "",
        dateOfBirth: undefined,
        email: "",
        password: "password123", // Default password for new users
    });
    setIsFormOpen(true);
  }

  const onUserSubmit = (values: UserFormValues) => {
    if (editingUser) {
        // Update existing user
        updateUser({ ...editingUser, ...values, dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd')});
        toast({
            title: "User Updated",
            description: "The user details have been successfully updated.",
        });
    } else {
        // Add new user
        addUser({
            ...values,
            dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
        });
         toast({
            title: "User Added",
            description: "The new user has been successfully created.",
        });
    }
    setIsFormOpen(false);
    setEditingUser(null);
  }
  
  const onCalendarSubmit = (values: CalendarFormValues) => {
    const file = values.file[0];
    const newFileName = `${values.scheme}_${values.district}_${values.year}.pdf`;
    
    // Here you would typically upload the file to a server.
    // We'll simulate it with a toast message.
    console.log("Uploading file:", file.name, "as", newFileName);
    
    toast({
        title: "Upload Successful",
        description: `File "${file.name}" has been saved as "${newFileName}".`,
    })

    calendarForm.reset({ year: "2025-2026" });
    if(calendarFileInputRef.current) {
        calendarFileInputRef.current.value = "";
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/png") {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setLogoPreview(dataUrl);
        };
        reader.readAsDataURL(file);
    } else {
        toast({
            title: "Invalid File",
            description: "Please upload a PNG file.",
            variant: "destructive"
        })
    }
  }

  const handleSaveLogo = () => {
      if (logoPreview) {
          setLogo(logoPreview);
          toast({
              title: "Logo Updated",
              description: "The site logo has been changed successfully."
          })
      }
  }
  
  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 text-center">
                <p>Loading...</p>
            </main>
            <Footer />
        </div>
    )
  }
  
  const canAccessAdminPanel = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  if (!canAccessAdminPanel) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                <p className="mt-4">You do not have permission to view this page.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Back to Home</Link>
                </Button>
            </main>
            <Footer />
        </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Panel - Master Data</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            &larr; Back to Home
          </Link>
        </div>

         <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
              setEditingUser(null);
              userForm.reset();
            }
         }}>
            <DialogContent className="sm:max-w-[600px]">
                 <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? "Update the details of the existing user." : "Fill in the details to create a new user."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={userForm.control}
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
                                control={userForm.control}
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
                                control={userForm.control}
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
                                control={userForm.control}
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
                                control={userForm.control}
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
                                control={userForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={userForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} {...field} />
                                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
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
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="signup-details">Sign Up Details</TabsTrigger>
                <TabsTrigger value="schemes">Schemes</TabsTrigger>
                <TabsTrigger value="local-bodies">Rural & Urban</TabsTrigger>
                <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
                <TabsTrigger value="settings">Site Settings</TabsTrigger>
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
                                  <TableCell>
                                    {user.password}
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
                        <Tabs defaultValue={MOCK_SCHEMES[0]?.id} className="w-full flex-col">
                            <TabsList>
                                {MOCK_SCHEMES.map(scheme => (
                                    <TabsTrigger key={scheme.id} value={scheme.id}>{scheme.name}</TabsTrigger>
                                ))}
                            </TabsList>
                            {MOCK_SCHEMES.map(scheme => (
                                <TabsContent key={scheme.id} value={scheme.id}>
                                     {scheme.name === 'MGNREGS' ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{scheme.name} Details</CardTitle>
                                                <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Category</TableHead>
                                                                <TableHead>Sub Category</TableHead>
                                                                <TableHead>Code Number</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {MOCK_MGNREGS_DATA.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{item.type}</TableCell>
                                                                    <TableCell>{item.category}</TableCell>
                                                                    <TableCell>{item.subCategory}</TableCell>
                                                                    <TableCell>{item.codeNumber}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                     ) : scheme.name === 'PMAY-G' ? (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{scheme.name} Details</CardTitle>
                                                <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Category</TableHead>
                                                                <TableHead>Sub Category</TableHead>
                                                                <TableHead>Code Number</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {MOCK_PMAYG_DATA.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{item.type}</TableCell>
                                                                    <TableCell>{item.category}</TableCell>
                                                                    <TableCell>{item.subCategory}</TableCell>
                                                                    <TableCell>{item.codeNumber}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                     ) : (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{scheme.name}</CardTitle>
                                                <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <p><strong>Type:</strong> {scheme.type}</p>
                                                <p><strong>Category:</strong> {scheme.category}</p>
                                                <p><strong>Sub Category:</strong> {scheme.subCategory}</p>
                                            </CardContent>
                                        </Card>
                                     )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="local-bodies">
                <Tabs defaultValue="panchayats" className="w-full">
                    <TabsList>
                        <TabsTrigger value="panchayats">Panchayats</TabsTrigger>
                        <TabsTrigger value="district-panchayats" disabled>District Panchayat</TabsTrigger>
                        <TabsTrigger value="corporations" disabled>Corporation</TabsTrigger>
                        <TabsTrigger value="municipalities" disabled>Municipality</TabsTrigger>
                        <TabsTrigger value="town-panchayats" disabled>Town Panchayat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="panchayats">
                        <Card>
                            <CardHeader>
                                <CardTitle>Panchayat List</CardTitle>
                                <CardDescription>
                                    List of all Panchayats with their respective codes and districts. Total: {filteredPanchayats.length}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                                    <Input placeholder="Filter by District..." value={panchayatFilters.district} onChange={(e) => handlePanchayatFilterChange('district', e.target.value)} />
                                    <Input placeholder="Filter by Block..." value={panchayatFilters.block} onChange={(e) => handlePanchayatFilterChange('block', e.target.value)} />
                                    <Input placeholder="Filter by Panchayat..." value={panchayatFilters.panchayat} onChange={(e) => handlePanchayatFilterChange('panchayat', e.target.value)} />
                                    <Input placeholder="Filter by LGD Code..." value={panchayatFilters.lgdCode} onChange={(e) => handlePanchayatFilterChange('lgdCode', e.target.value)} />
                                    <Button>Get Reports</Button>
                                </div>
                                <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">S.No</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Block</TableHead>
                                        <TableHead>Panchayat</TableHead>
                                        <TableHead>LDG Code</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {paginatedPanchayats.map((item, index) => (
                                        <TableRow key={item.lgdCode}>
                                          <TableCell>{(panchayatCurrentPage - 1) * panchayatsPerPage + index + 1}</TableCell>
                                          <TableCell>{toTitleCase(item.district)}</TableCell>
                                          <TableCell>{toTitleCase(item.block)}</TableCell>
                                          <TableCell className="font-medium">{toTitleCase(item.name)}</TableCell>
                                          <TableCell>{item.lgdCode}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                                        <Select value={String(panchayatsPerPage)} onValueChange={handlePanchayatsPerPageChange}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[15, 25, 50, 75, 100].map(val => (
                                                    <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">
                                            Page {panchayatCurrentPage} of {panchayatTotalPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <Button onClick={handlePrevPanchayatPage} disabled={panchayatCurrentPage === 1} variant="outline" size="sm">
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="sr-only">Previous</span>
                                            </Button>
                                            <Button onClick={handleNextPanchayatPage} disabled={panchayatCurrentPage === panchayatTotalPages} variant="outline" size="sm">
                                                <span className="sr-only">Next</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </TabsContent>
             <TabsContent value="feedbacks">
                 <Card>
                    <CardHeader>
                        <CardTitle>User Feedbacks</CardTitle>
                         <CardDescription>
                            List of all submitted feedbacks from users. Total: {feedbacks.length}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>S.No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead>Submitted At</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {feedbacks.map((feedback, index) => (
                                <TableRow key={feedback.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-medium">{feedback.name}</TableCell>
                                  <TableCell>{feedback.email}</TableCell>
                                  <TableCell className="max-w-xs truncate">{feedback.feedback}</TableCell>
                                  <TableCell>{format(new Date(feedback.submittedAt), 'dd/MM/yyyy hh:mm a')}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="settings">
                 <Tabs defaultValue="logo-upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="logo-upload">Logo Upload</TabsTrigger>
                        <TabsTrigger value="calendar-upload">Calendar Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="logo-upload">
                        <Card>
                            <CardHeader>
                                <CardTitle>Site Settings</CardTitle>
                                <CardDescription>
                                    Manage global site settings, such as the logo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-primary">Upload Logo</h3>
                                    <p className="text-sm text-muted-foreground">Upload a PNG file to be used as the site logo in the header and footer.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                                    {logoPreview ? (
                                        <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="object-contain p-1" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                    <input type="file" accept="image/png" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                                    <Button onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose PNG File
                                        </Button>
                                    <Button onClick={handleSaveLogo} disabled={!logoPreview || logoPreview === logo}>Save Logo</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="calendar-upload">
                       <Card>
                            <CardHeader>
                                <CardTitle>Calendar Upload</CardTitle>
                                <CardDescription>
                                    Upload PDF files for scheme calendars.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...calendarForm}>
                                    <form onSubmit={calendarForm.handleSubmit(onCalendarSubmit)} className="space-y-6">
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <FormField
                                                control={calendarForm.control}
                                                name="scheme"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Scheme</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={calendarForm.control}
                                                name="year"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Year</FormLabel>
                                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="2025-2026">2025-2026</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={calendarForm.control}
                                                name="district"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>District</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={calendarForm.control}
                                                name="file"
                                                render={({ field }) => {
                                                    return (
                                                    <FormItem>
                                                        <FormLabel>PDF File</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="file" 
                                                                accept=".pdf"
                                                                ref={calendarFileInputRef}
                                                                onChange={(e) => field.onChange(e.target.files)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )
                                                }}
                                             />
                                       </div>
                                       <div className="flex justify-end">
                                        <Button type="submit">
                                            <FileUp className="mr-2 h-4 w-4" />
                                            Upload Calendar
                                        </Button>
                                       </div>
                                    </form>
                                </Form>
                            </CardContent>
                       </Card>
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
