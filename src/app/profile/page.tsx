
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
    { name: 'Lavender Bliss', id: 'lavender', colors: ['#F5F3FF', '#5D54A4', '#E0D3FF', '#C7B4FF'] },
    { name: 'Oceanic Blue', id: 'oceanic', colors: ['#EFF8FF', '#1D4ED8', '#D1E0FF', '#A7C7E7'] },
    { name: 'Forest Green', id: 'forest', colors: ['#F0FFF4', '#15803D', '#D4F0E0', '#A3D9B8'] },
    { name: 'Sunset Orange', id: 'sunset', colors: ['#FFF7ED', '#EA580C', '#FFE8D6', '#FDBA74'] },
    { name: 'Dark Slate', id: 'dark-slate', colors: ['#1E293B', '#F1F5F9', '#334155', '#64748B'] },
    { name: 'Rose Petal', id: 'rose', colors: ['#FFF1F2', '#BE123C', '#FECDD3', '#FDA4AF'] },
    { name: 'Crimson Night', id: 'crimson-dark', colors: ['#260000', '#FFD1D1', '#5B0000', '#A30000'] },
    { name: 'Sapphire Night', id: 'sapphire-dark', colors: ['#0A192F', '#A8B2D1', '#112240', '#303C55'] },
    { name: 'High Contrast', id: 'high-contrast', colors: ['#000000', '#FFFFFF', '#333333', '#CCCCCC'] },
];

const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    const selectedTheme = themes.find(t => t.id === themeId) || themes[0];

    if (themeId.includes('dark') || themeId.includes('contrast')) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    
    // A simplified mapping from palette to CSS variables
    // In a real scenario, you would generate HSL values from these hex codes
    // For now, we'll just set the primary ones
    const [background, primary, card, accent] = selectedTheme.colors;
    root.style.setProperty('--background-hex', background);
    root.style.setProperty('--primary-hex', primary);
    root.style.setProperty('--card-hex', card);
    root.style.setProperty('--accent-hex', accent);
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
            setSelectedTheme(user.theme || 'default');
            setProfilePicture(user.profilePicture || null);
            setPreviewPicture(user.profilePicture || null);
            applyTheme(user.theme || 'default');
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
            // We also need to update the user in the AuthContext to reflect changes immediately
            // This is a workaround since our updateUser doesn't automatically refresh the Auth context
            setTimeout(() => {
                toast({
                    title: 'Profile Saved!',
                    description: 'Your changes have been saved. Signing out to apply changes.',
                });
                signOut();
            }, 1000);
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

