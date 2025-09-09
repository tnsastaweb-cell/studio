
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { useUsers } from '@/services/users';
import { sendOtp, verifyOtp } from '@/ai/flows/otp-flow';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }).optional(),
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
    
    const [step, setStep] = useState(1); // 1: Enter Code, 2: Enter OTP, 3: Reset Password
    const [isProcessing, setIsProcessing] = useState(false);
    const [flowError, setFlowError] = useState<string | null>(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { employeeCode: "" },
    });

    const handleSendOtp = async () => {
        setFlowError(null);
        const employeeCode = form.getValues('employeeCode');
        const user = users.find(u => u.employeeCode === employeeCode);

        if (!user) {
            form.setError("employeeCode", { type: "manual", message: "Employee code not found." });
            return;
        }
        if (!user.email) {
            form.setError("employeeCode", { type: "manual", message: "No email is associated with this account. Please contact an admin." });
            return;
        }

        setIsProcessing(true);
        try {
            const result = await sendOtp({ email: user.email });
            if (result.success) {
                setVerifiedEmail(user.email);
                setStep(2);
                toast({ title: 'Success', description: 'OTP sent to your registered email address.' });
            } else {
                setFlowError(result.message);
            }
        } catch (error) {
            setFlowError("An unexpected error occurred while sending OTP.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleVerifyOtp = async () => {
        setFlowError(null);
        const otp = form.getValues('otp');
        if (!verifiedEmail || !otp || otp.length !== 6) {
            form.trigger('otp');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await verifyOtp({ email: verifiedEmail, otp });
            if (result.success) {
                setStep(3);
                toast({ title: 'Success', description: 'OTP verified. You can now reset your password.' });
            } else {
                 form.setError('otp', { type: 'manual', message: result.message });
            }
        } catch (error) {
             setFlowError("An unexpected error occurred during OTP verification.");
        } finally {
            setIsProcessing(false);
        }
    }


    const onSubmit = (values: ResetPasswordFormValues) => {
        const user = users.find(u => u.employeeCode === values.employeeCode);

        if (user) {
            updateUser({ ...user, password: values.newPassword });
            toast({
                title: "Password Updated",
                description: "Your password has been successfully updated. Please sign in.",
            });
            router.push('/signin');
        }
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
                        {flowError && <Alert variant="destructive" className="mb-4"><AlertDescription>{flowError}</AlertDescription></Alert>}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="employeeCode" render={({ field }) => (
                                    <FormItem><FormLabel>Employee Code</FormLabel>
                                    <FormControl><Input placeholder="Your Employee Code" {...field} disabled={step !== 1} /></FormControl>
                                    <FormMessage /></FormItem>
                                )} />
                                
                                {step === 1 && (
                                     <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isProcessing}>
                                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Send OTP
                                     </Button>
                                )}

                                {step === 2 && (
                                    <>
                                        <FormField control={form.control} name="otp" render={({ field }) => (
                                            <FormItem><FormLabel>Enter OTP</FormLabel>
                                            <FormControl><Input placeholder="6-digit OTP" {...field} /></FormControl>
                                            <FormMessage /></FormItem>
                                        )} />
                                        <Button type="button" className="w-full" onClick={handleVerifyOtp} disabled={isProcessing}>
                                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Verify OTP
                                        </Button>
                                    </>
                                )}

                                {step === 3 && (
                                <>
                                    <FormField control={form.control} name="newPassword" render={({ field }) => (
                                        <FormItem><FormLabel>New Password</FormLabel>
                                            <FormControl><div className="relative">
                                                <Input type={showNewPassword ? "text" : "password"} placeholder="New Password" {...field} />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem><FormLabel>Confirm New Password</FormLabel>
                                            <FormControl><div className="relative">
                                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...field} />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div></FormControl><FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="w-full">Reset Password</Button>
                                </>
                                )}
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
