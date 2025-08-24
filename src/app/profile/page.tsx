
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
    { name: 'Default', id: 'default', colors: ['#F4F4F2', '#495464', '#E8E8E8', '#BBBFCA'], isDark: false },
    { name: 'Oceanic', id: 'oceanic', colors: ['#2C3E50', '#34495E', '#95A5A6', '#BDC3C7'], isDark: true },
    { name: 'Earthy Green', id: 'earthy-green', colors: ['#F0F3E5', '#6B8E23', '#A9C27C', '#C9D9A7'], isDark: false },
    { name: 'Coastal', id: 'coastal', colors: ['#EBE3D5', '#52796F', '#84A98C', '#CAD2C5'], isDark: false },
    { name: 'Clay', id: 'clay', colors: ['#F5EBE0', '#A98467', '#D4A373', '#EAD2AC'], isDark: false },
    { name: 'Lavender Sky', id: 'lavender-sky', colors: ['#E6E6FA', '#6A5ACD', '#9370DB', '#B19CD9'], isDark: false },
    { name: 'Deep Indigo', id: 'deep-indigo', colors: ['#3A3A5A', '#4F4F7A', '#7878AB', '#A0A0CD'], isDark: true },
    { name: 'Blush Pink', id: 'blush-pink', colors: ['#FFF0F5', '#FFB6C1', '#FFC0CB', '#FFE4E1'], isDark: false },
    { name: 'Pastel Lilac', id: 'pastel-lilac', colors: ['#F3E8FF', '#D6B4FC', '#C8A2C8', '#A474A9'], isDark: false },
    { name: 'Aqua', id: 'aqua', colors: ['#E0FFFF', '#00CED1', '#40E0D0', '#7FFFD4'], isDark: false },
    { name: 'Royal Blue', id: 'royal-blue', colors: ['#F0F8FF', '#4169E1', '#6495ED', '#B0C4DE'], isDark: false },
    { name: 'Teal & Black', id: 'teal-black', colors: ['#1A2A3A', '#2D3E50', '#00A99D', '#A1D9D9'], isDark: true },
];

const themeHslMap: { [key: string]: { [key: string]: string } } = {
    default: { "--background": "48 33% 96%", "--foreground": "215 15% 34%", "--card": "0 0% 91%", "--primary": "215 15% 34%", "--accent": "222 11% 77%" },
    oceanic: { "--background": "210 20% 23%", "--foreground": "210 10% 80%", "--card": "210 25% 27%", "--primary": "204 15% 75%", "--accent": "210 10% 40%" },
    'earthy-green': { "--background": "80 30% 95%", "--foreground": "80 45% 25%", "--card": "80 30% 88%", "--primary": "80 40% 48%", "--accent": "80 30% 75%" },
    coastal: { "--background": "40 25% 94%", "--foreground": "165 25% 30%", "--card": "165 20% 85%", "--primary": "165 25% 40%", "--accent": "165 20% 65%" },
    clay: { "--background": "33 43% 94%", "--foreground": "29 34% 40%", "--card": "30 45% 85%", "--primary": "29 34% 53%", "--accent": "30 45% 75%" },
    'lavender-sky': { "--background": "240 67% 97%", "--foreground": "248 39% 50%", "--card": "248 50% 92%", "--primary": "248 39% 50%", "--accent": "248 50% 85%" },
    'deep-indigo': { "--background": "240 25% 28%", "--foreground": "240 30% 85%", "--card": "240 20% 35%", "--primary": "240 30% 75%", "--accent": "240 20% 50%" },
    'blush-pink': { "--background": "350 100% 98%", "--foreground": "348 83% 60%", "--card": "350 100% 95%", "--primary": "348 83% 60%", "--accent": "350 100% 90%" },
    'pastel-lilac': { "--background": "276 100% 97%", "--foreground": "276 60% 55%", "--card": "276 70% 92%", "--primary": "276 60% 55%", "--accent": "276 70% 85%" },
    aqua: { "--background": "180 100% 97%", "--foreground": "181 100% 35%", "--card": "180 80% 90%", "--primary": "177 100% 44%", "--accent": "180 80% 80%" },
    'royal-blue': { "--background": "210 100% 98%", "--foreground": "226 71% 51%", "--card": "210 80% 92%", "--primary": "226 71% 51%", "--accent": "210 80% 85%" },
    'teal-black': { "--background": "210 30% 16%", "--foreground": "208 40% 90%", "--card": "210 30% 23%", "--primary": "177 100% 34%", "--accent": "210 30% 40%" },
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
