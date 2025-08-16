
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { useUsers } from '@/services/users';
import { Eye, EyeOff } from 'lucide-react';

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

const passwordSchema = z.string()
  .min(8, "Must be at least 8 characters")
  .refine(value => /[A-Z]/.test(value), "Must contain at least one uppercase letter")
  .refine(value => /[0-9]/.test(value), "Must contain at least one number")
  .refine(value => /[^A-Za-z0-9]/.test(value), "Must contain at least one special character");

const resetPasswordSchema = z.object({
  employeeCode: z.string().min(1, { message: "Employee code is required." }),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { users, updateUser } = useUsers();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            employeeCode: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: ResetPasswordFormValues) => {
        const user = users.find(u => u.employeeCode === values.employeeCode);

        if (!user) {
            form.setError("employeeCode", { type: "manual", message: "Employee code not found." });
            return;
        }
        
        if (!user.email) {
            toast({
                variant: 'destructive',
                title: "Cannot Reset Password",
                description: "No email is associated with this account. Please contact an admin.",
            });
            return;
        }

        // In a real app, you'd handle token verification. Here we'll just update it.
        updateUser({ ...user, password: values.newPassword });

        // Simulate sending a password reset link
        toast({
            title: "Password Reset Email Sent (Simulation)",
            description: `A password reset link has been sent to ${user.email}.`,
        });

        setTimeout(() => {
             toast({
                title: "Password Updated",
                description: "Your password has been successfully updated. Please sign in.",
            });
            router.push('/signin');
        }, 2000);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-3xl">Reset Password</CardTitle>
                        <CardDescription>Enter your employee code and new password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="employeeCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Employee Code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type={showNewPassword ? "text" : "password"} placeholder="New Password" {...field} />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                 <div className="relative">
                                                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...field} />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Reset Password</Button>
                            </form>
                        </Form>
                         <div className="mt-6 text-center text-sm">
                            Remember your password?{" "}
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
