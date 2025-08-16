
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { Check, X, Eye, EyeOff } from 'lucide-react';

import { useUsers, User } from '@/services/users';
import { cn } from "@/lib/utils";

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.string()
  .min(8, "Must be at least 8 characters")
  .refine(value => /[A-Z]/.test(value), "Must contain at least one uppercase letter")
  .refine(value => /[0-9]/.test(value), "Must contain at least one number")
  .refine(value => /[^A-Za-z0-9]/.test(value), "Must contain at least one special character");

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  employeeCode: z.string().min(1, { message: "Employee code is required." }),
  designation: z.string(),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: "Mobile number must be 10 digits." }),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: passwordSchema,
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const PasswordValidationIndicator = ({ label, isValid }: { label: string, isValid: boolean }) => (
    <div className={cn("flex items-center text-sm", isValid ? "text-green-600" : "text-destructive")}>
        {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
        <span>{label}</span>
    </div>
);

export default function SignUpPage() {
    const { users, updateUser } = useUsers();
    const [employeeCodeQuery, setEmployeeCodeQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        mode: 'onTouched',
        defaultValues: {
            name: "",
            employeeCode: "",
            mobileNumber: "",
            email: "",
            password: "",
        },
    });

    const handleEmployeeCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setEmployeeCodeQuery(query);
        form.setValue('employeeCode', query);
        setShowSuggestions(true);

        // Clear other fields if query is empty
        if (!query) {
            form.reset({
                ...form.getValues(),
                name: "",
                designation: undefined,
                mobileNumber: "",
                dateOfBirth: undefined,
            });
        }
    };

    const handleEmployeeSelect = (user: User) => {
        setEmployeeCodeQuery(user.employeeCode);
        setShowSuggestions(false);
        form.reset({
            ...form.getValues(),
            name: user.name,
            employeeCode: user.employeeCode,
            designation: user.designation,
            mobileNumber: user.mobileNumber,
            dateOfBirth: new Date(user.dateOfBirth),
        });
    };

    const onSubmit = (values: SignUpFormValues) => {
        const userToUpdate = users.find(u => u.employeeCode === values.employeeCode);
        if (userToUpdate) {
            updateUser({
                ...userToUpdate,
                email: values.email,
                password: values.password,
            });
        }
        
        toast({
            title: "Sign Up Successful!",
            description: "Your account has been created. Please sign in.",
        });

        router.push('/signin');
    };
    
    const password = form.watch('password');
    const passwordValidations = {
        length: (password || '').length >= 8,
        uppercase: /[A-Z]/.test(password || ''),
        number: /[0-9]/.test(password || ''),
        specialChar: /[^A-Za-z0-9]/.test(password || ''),
    };

    const filteredUsers = employeeCodeQuery && showSuggestions
        ? users.filter(user =>
            user.employeeCode.toLowerCase().includes(employeeCodeQuery.toLowerCase()) && !user.email
          ).slice(0, 5) // Limit suggestions
        : [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle className="text-3xl">Sign Up</CardTitle>
                        <CardDescription>Create your account by verifying your employee details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {/* Column 1 */}
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="employeeCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Employee Code</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                placeholder="Type to search your employee code" 
                                                                value={form.getValues('employeeCode')}
                                                                onChange={handleEmployeeCodeChange}
                                                                autoComplete="off"
                                                            />
                                                            {filteredUsers.length > 0 && (
                                                                <div className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg">
                                                                    {filteredUsers.map(user => (
                                                                        <div
                                                                            key={user.id}
                                                                            className="p-2 hover:bg-accent cursor-pointer"
                                                                            onClick={() => handleEmployeeSelect(user)}
                                                                        >
                                                                            {user.employeeCode}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Full Name" {...field} readOnly className="bg-muted"/>
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
                                                    <FormControl>
                                                        <Input placeholder="Designation" value={field.value || ''} readOnly className="bg-muted"/>
                                                    </FormControl>
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
                                                        <Input placeholder="10-digit number" {...field} readOnly className="bg-muted"/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date of Birth</FormLabel>
                                                     <FormControl>
                                                        <Input 
                                                            placeholder="Date of Birth" 
                                                            value={field.value ? format(field.value, "dd/MM/yyyy") : ''} 
                                                            readOnly 
                                                            className="bg-muted"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    {/* Column 2 */}
                                    <div className="space-y-4">
                                       <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="your.email@example.com" {...field} />
                                                    </FormControl>
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

                                        <div className="p-4 border rounded-md space-y-2 bg-background">
                                            <h4 className="font-semibold text-sm">Password must contain:</h4>
                                             <PasswordValidationIndicator label="At least 8 characters" isValid={passwordValidations.length} />
                                             <PasswordValidationIndicator label="At least one uppercase letter" isValid={passwordValidations.uppercase} />
                                             <PasswordValidationIndicator label="At least one number" isValid={passwordValidations.number} />
                                             <PasswordValidationIndicator label="At least one special character" isValid={passwordValidations.specialChar} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" size="lg" className="w-full md:w-auto">Create Account</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
