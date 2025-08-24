
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUsers } from '@/services/users';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Palette, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const themes = [
    { name: 'Default', id: 'default', colors: ['#F4F4F2', '#495464', '#E8E8E8', '#BBBFCA'] },
    { name: 'Ocean Breeze', id: 'ocean-breeze', colors: ['#E7F6F2', '#2C3333', '#A5C9CA', '#395B64'] },
    { name: 'Earthy Sage', id: 'earthy-sage', colors: ['#F0EBE3', '#576F72', '#7D9D9C', '#E4DCCF'] },
    { name: 'Warm Clay', id: 'warm-clay', colors: ['#F3EEEA', '#776B5D', '#EBE3D5', '#B0A695'] },
    { name: 'Desert Sunset', id: 'desert-sunset', colors: ['#F8EDE3', '#7D6E83', '#DFD3C3', '#D0B8A8'] },
    { name: 'Olive Grove', id: 'olive-grove', colors: ['#EDF1D6', '#40513B', '#609966', '#9DC08B'] },
    { name: 'Cool Slate', id: 'cool-slate', colors: ['#DDE6ED', '#27374D', '#9DB2BF', '#526D82'] },
    { name: 'Rosewater', id: 'rosewater', colors: ['#DCD7C9', '#2C3639', '#A27B5C', '#3F4E4F'] },
    { name: 'Lavender Sky', id: 'lavender-sky', colors: ['#F4EEFF', '#424874', '#DCD6F7', '#A6B1E1'] },
    { name: 'Modern Teal', id: 'modern-teal', colors: ['#EEEEEE', '#222831', '#00ADB5', '#393E46'] },
];

const themeHslMap: { [key: string]: { [key: string]: string } } = {
    default: { "--background": "48 33% 96%", "--foreground": "215 15% 34%", "--card": "0 0% 91%", "--primary": "215 15% 34%", "--accent": "222 11% 77%" },
    'ocean-breeze': { "--background": "165 42% 94%", "--foreground": "180 6% 19%", "--card": "182 27% 72%", "--primary": "180 6% 19%", "--accent": "196 29% 31%" },
    'earthy-sage': { "--background": "40 31% 91%", "--foreground": "189 13% 40%", "--card": "181 14% 69%", "--primary": "189 13% 40%", "--accent": "40 31% 88%" },
    'warm-clay': { "--background": "36 29% 94%", "--foreground": "32 10% 41%", "--card": "40 31% 91%", "--primary": "32 10% 41%", "--accent": "34 16% 64%" },
    'desert-sunset': { "--background": "30 64% 94%", "--foreground": "283 10% 44%", "--card": "35 29% 85%", "--primary": "283 10% 44%", "--accent": "30 33% 71%" },
    'olive-grove': { "--background": "76 43% 90%", "--foreground": "83 17% 28%", "--card": "145 25% 48%", "--primary": "83 17% 28%", "--accent": "91 32% 65%" },
    'cool-slate': { "--background": "210 29% 90%", "--foreground": "215 33% 23%", "--card": "208 19% 72%", "--primary": "215 33% 23%", "--accent": "209 24% 41%" },
    'rosewater': { "--background": "43 15% 82%", "--foreground": "202 12% 20%", "--card": "26 31% 56%", "--primary": "202 12% 20%", "--accent": "182 10% 28%" },
    'lavender-sky': { "--background": "252 100% 96%", "--foreground": "236 29% 36%", "--card": "246 65% 91%", "--primary": "236 29% 36%", "--accent": "226 50% 77%" },
    'modern-teal': { "--background": "0 0% 93%", "--foreground": "209 16% 16%", "--card": "183 100% 36%", "--primary": "209 16% 16%", "--accent": "214 9% 25%" },
};


const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    const theme = themeHslMap[themeId] || themeHslMap['default'];
    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    const isDark = themes.find(t => t.id === themeId)?.isDark || false;
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

export default function ProfilePage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { updateUser, users } = useUsers();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [selectedTheme, setSelectedTheme] = useState(user?.theme || 'default');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
    const [previewPicture, setPreviewPicture] = useState(user?.profilePicture || null);
    
    useEffect(() => {
        if (user) {
            const currentTheme = user.theme || 'default';
            setSelectedTheme(currentTheme);
            setProfilePicture(user.profilePicture || null);
            setPreviewPicture(user.profilePicture || null);
            applyTheme(currentTheme);
        } else {
            // Apply default theme if no user is logged in
            applyTheme('default');
        }
    }, [user]);

    const handleThemeChange = (themeId: string) => {
        setSelectedTheme(themeId);
        applyTheme(themeId);
    };

    const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid File',
                description: 'Please upload a valid image file.',
            });
        }
    };
    
    const handleSave = () => {
        if (!user) return;
        const currentUser = users.find(u => u.id === user.id);
        if (currentUser) {
            updateUser({
                ...currentUser,
                theme: selectedTheme,
                profilePicture: previewPicture,
            });
            toast({
                title: 'Profile Saved!',
                description: 'Your new theme and photo have been saved.',
            });
        }
    };

    if (authLoading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                 <p className="mb-4">You need to be signed in to view this page.</p>
                 <Button asChild><Link href="/signin">Sign In</Link></Button>
            </div>
        );
    }
    
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl">My Profile</CardTitle>
                <CardDescription>Manage your personal information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={previewPicture || undefined} alt={user.name} />
                            <AvatarFallback>
                                <UserIcon className="h-16 w-16" />
                            </AvatarFallback>
                        </Avatar>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handlePictureUpload}
                          className="hidden"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                           <Upload className="mr-2" /> Upload Photo
                        </Button>
                    </div>
                     <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-4xl font-bold text-primary">{user.name}</h2>
                        <p className="text-xl text-muted-foreground">{user.designation}</p>
                        <p className="text-md text-muted-foreground">{user.employeeCode}</p>
                     </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold flex items-center gap-2"><Palette/> Color Theme</h3>
                    <p className="text-muted-foreground">Choose a color palette that suits your style. The change will be applied across the site.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {themes.map(theme => (
                            <button 
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={cn(
                                    "p-2 border-2 rounded-lg transition-all",
                                    selectedTheme === theme.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-primary/50'
                                )}
                            >
                                <div className="flex space-x-1 h-12 w-full">
                                    {theme.colors.map((color, index) => (
                                        <div key={index} className="w-1/4 h-full rounded" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                                <p className="mt-2 text-sm font-medium text-center">{theme.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={handleSave}>Save Profile</Button>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
