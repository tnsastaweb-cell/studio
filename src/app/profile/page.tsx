
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
    { name: 'Oceanic Blue', id: 'oceanic', colors: ['#EFF8FF', '#1D4ED8', '#D1E0FF', '#A7C7E7'], isDark: false },
    { name: 'Forest Green', id: 'forest', colors: ['#F0FFF4', '#15803D', '#D4F0E0', '#A3D9B8'], isDark: false },
    { name: 'Lavender Bliss', id: 'lavender', colors: ['#F5F3FF', '#5D54A4', '#E0D3FF', '#C7B4FF'], isDark: false },
    { name: 'Sunset Orange', id: 'sunset', colors: ['#FFF7ED', '#EA580C', '#FFE8D6', '#FDBA74'], isDark: false },
    { name: 'Rose Petal', id: 'rose', colors: ['#FFF1F2', '#BE123C', '#FECDD3', '#FDA4AF'], isDark: false },
    { name: 'Minty Fresh', id: 'mint', colors: ['#F0FDFA', '#0F766E', '#C2F5EE', '#8EDFD8'], isDark: false },
    { name: 'Golden Sand', id: 'sand', colors: ['#FEFCE8', '#A16207', '#FEF9C3', '#FAF089'], isDark: false },
    { name: 'Slate Blue', id: 'slate-blue', colors: ['#F8FAFC', '#475569', '#E2E8F0', '#CBD5E1'], isDark: false },
    { name: 'Orchid Purple', id: 'orchid', colors: ['#FBF5FF', '#7E22CE', '#F3E8FF', '#E9D5FF'], isDark: false },
];

const themeHslMap: { [key: string]: { [key: string]: string } } = {
    default: {
        "--background": "48 33% 96%",
        "--foreground": "215 15% 34%",
        "--card": "0 0% 91%",
        "--primary": "215 15% 34%",
        "--accent": "222 11% 77%",
    },
    oceanic: {
        "--background": "208 100% 96%",
        "--foreground": "221 78% 46%",
        "--card": "216 100% 95%",
        "--primary": "221 78% 46%",
        "--accent": "214 68% 85%",
    },
    forest: {
        "--background": "140 100% 97%",
        "--foreground": "146 70% 30%",
        "--card": "148 57% 92%",
        "--primary": "146 70% 30%",
        "--accent": "143 45% 82%",
    },
     lavender: {
        "--background": "246 100% 97%",
        "--foreground": "246 32% 49%",
        "--card": "252 100% 95%",
        "--primary": "246 32% 49%",
        "--accent": "256 100% 89%",
    },
    sunset: {
        "--background": "34 100% 96%",
        "--foreground": "26 94% 41%",
        "--card": "31 100% 94%",
        "--primary": "26 94% 41%",
        "--accent": "36 96% 75%",
    },
     rose: {
        "--background": "356 100% 97%",
        "--foreground": "344 80% 41%",
        "--card": "355 94% 92%",
        "--primary": "344 80% 41%",
        "--accent": "355 93% 82%",
    },
    mint: {
        "--background": "169 100% 97%",
        "--foreground": "175 79% 27%",
        "--card": "170 82% 90%",
        "--primary": "175 79% 27%",
        "--accent": "172 71% 81%",
    },
    sand: {
        "--background": "55 100% 96%",
        "--foreground": "45 93% 32%",
        "--card": "55 96% 89%",
        "--primary": "45 93% 32%",
        "--accent": "53 91% 76%",
    },
    'slate-blue': {
        "--background": "215 20% 97%",
        "--foreground": "222 17% 35%",
        "--card": "222 47% 95%",
        "--primary": "222 17% 35%",
        "--accent": "220 26% 90%",
    },
    orchid: {
        "--background": "283 100% 98%",
        "--foreground": "278 70% 47%",
        "--card": "276 100% 96%",
        "--primary": "278 70% 47%",
        "--accent": "273 65% 91%",
    },
};

const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    const theme = themeHslMap[themeId] || themeHslMap['default'];

    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Handle dark class separately if needed, but for now, all are light
    root.classList.remove('dark');
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
             // No need to sign out to apply theme, but we might need to if other things depend on it.
             // For now, let's keep the user signed in.
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
                                <div className="flex space-x-1 h-12">
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


