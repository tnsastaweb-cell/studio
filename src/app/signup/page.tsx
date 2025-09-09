
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { Check, X, Eye, EyeOff, Loader2 } from 'lucide-react';

import { useUsers, User } from '@/services/users';
import { sendOtp, verifyOtp } from '@/ai/flows/otp-flow';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  otp: z.string().length(6, { message: "OTP must be 6 digits."}).optional(),
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
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [flowError, setFlowError] = useState<string | null>(null);

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
    
    const handleSendOtp = async () => {
        setFlowError(null);
        const email = form.getValues('email');
        const emailState = form.getFieldState('email');
        if (!email || emailState.invalid) {
            form.trigger('email');
            return;
        }
        setIsSendingOtp(true);
        try {
            const result = await sendOtp({ email });
            if (result.success) {
                setIsOtpSent(true);
                toast({ title: 'Success', description: 'OTP sent to your email address.' });
            } else {
                setFlowError(result.message);
            }
        } catch (error) {
            console.error(error);
            setFlowError('An unexpected error occurred.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        setFlowError(null);
        const email = form.getValues('email');
        const otp = form.getValues('otp');
        if (!otp || otp.length !== 6) {
            form.trigger('otp');
            return;
        }
        setIsVerifyingOtp(true);
        try {
            const result = await verifyOtp({ email, otp });
            if (result.success) {
                setIsOtpVerified(true);
                toast({ title: 'Success', description: 'Email verified successfully.' });
            } else {
                form.setError('otp', { type: 'manual', message: result.message });
            }
        } catch (error) {
            console.error(error);
            setFlowError('An unexpected error occurred.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };


    const onSubmit = (values: SignUpFormValues) => {
        if (!isOtpVerified) {
            toast({ variant: 'destructive', title: "Email Not Verified", description: "Please verify your email with OTP first."});
            return;
        }
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
          ).slice(0, 5)
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
                                {flowError && <Alert variant="destructive"><AlertDescription>{flowError}</AlertDescription></Alert>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="employeeCode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee Code</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input placeholder="Type to search your employee code" value={form.getValues('employeeCode')} onChange={handleEmployeeCodeChange} autoComplete="off" />
                                                        {filteredUsers.length > 0 && (
                                                            <div className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg">
                                                                {filteredUsers.map(user => (
                                                                    <div key={user.id} className="p-2 hover:bg-accent cursor-pointer" onClick={() => handleEmployeeSelect(user)}>
                                                                        {user.employeeCode} - {user.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl><FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="designation" render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input {...field} readOnly className="bg-muted"/></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input value={field.value ? format(field.value, "dd/MM/yyyy") : ''} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <div className="space-y-4">
                                       <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email ID</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl><Input type="email" placeholder="your.email@example.com" {...field} disabled={isOtpSent} /></FormControl>
                                                    <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp || isOtpSent}>
                                                        {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                                                    </Button>
                                                </div><FormMessage />
                                            </FormItem>
                                       )} />
                                       
                                       {isOtpSent && !isOtpVerified && (
                                           <FormField control={form.control} name="otp" render={({ field }) => (
                                               <FormItem><FormLabel>Enter OTP</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl><Input placeholder="6-digit OTP" {...field} /></FormControl>
                                                     <Button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
                                                        {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify OTP
                                                    </Button>
                                                </div><FormMessage />
                                               </FormItem>
                                           )} />
                                       )}
                                       {isOtpVerified && <div className="p-2 text-center rounded-md bg-green-100 text-green-700 font-medium">Email Verified!</div>}
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem><FormLabel>Password</FormLabel>
                                                <FormControl><div className="relative">
                                                    <Input type={showPassword ? "text" : "password"} {...field} />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div></FormControl><FormMessage />
                                            </FormItem>
                                        )} />

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
                                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={!isOtpVerified}>Create Account</Button>
                                </div>
                            </form>
                        </Form>
                         <div className="mt-6 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/signin" className="underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
