
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { OrganizationalChart } from '@/components/organizational-chart';

interface Contact {
  id: number;
  role: string;
  name: string;
  phone: string;
}

const initialContacts: Contact[] = [
    { id: 1, role: 'The Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 2, role: 'Joint Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 3, role: 'Joint Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 4, role: 'Assistant Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 5, role: 'Assistant Director', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
    { id: 6, role: 'Consultant', name: 'Thiru. [Name Placeholder]', phone: '044-XXXX XXXX' },
];


export default function AboutUsPage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const { toast } = useToast();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you would typically send the data to a server
    setIsEditing(false);
    toast({
        title: "Saved!",
        description: "The contact information has been updated.",
    });
  };
  
  const handleCancel = () => {
    setContacts(initialContacts); // Reset changes
    setIsEditing(false);
  }

  const handleContactChange = (id: number, field: 'name' | 'phone', value: string) => {
    setContacts(currentContacts =>
      currentContacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };
  
  const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-12">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-4">About Us</h1>
            <p className="text-lg text-muted-foreground">Social Audit Society of Tamil Nadu (SASTA)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>A Brief Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/90 font-normal">
                       <p>The Social Audit Society of Tamil Nadu (SASTA) is a state-level autonomous institution under the Department of Rural Development and Panchayat Raj. It is dedicated to promoting transparency and accountability through community-led audits for schemes like MGNREGS and PMAY-G.</p>
                    </CardContent>
                </Card>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mission</CardTitle>
                        </CardHeader>
                        <CardContent className="text-foreground/90 font-normal">
                            <p>To ensure inclusive governance by empowering communities to audit and evaluate the delivery of public schemes through participatory processes.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vision</CardTitle>
                        </CardHeader>
                        <CardContent className="text-foreground/90 font-normal">
                             <p>A governance ecosystem where every citizen plays a role in upholding accountability, integrity, and equitable development.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Office Address & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-foreground/90 font-normal">
                        <p><strong>Address:</strong> Panagal Maligai, Saidapet, Chennai - 600015, Tamil Nadu, India.</p>
                        <p><strong>Phone:</strong> 044-XXXX XXXX / 044-YYYY YYYY</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Emails</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-foreground/90 font-normal break-all">
                        <p>sasta.accts@gmail.com</p>
                        <p>sasta.audit@gmail.com</p>
                        <p>sadirectorate@gmail.com</p>
                        <p>sasta.report@gmail.com</p>
                        <p>sadirectorate.mis@gmail.com</p>
                        <p>sasta.accounts@gmail.com</p>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <Separator />

        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-primary">Structure of Social Audit Unit</h2>
                {!loading && canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                             <Button onClick={handleEditToggle}>Edit</Button>
                        )}
                    </div>
                )}
            </div>
             <Card>
                <CardContent className="p-6 space-y-4">
                    {contacts.map(contact => (
                         <div key={contact.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <p className="font-semibold text-primary">{contact.role}</p>
                            {isEditing ? (
                                <>
                                    <Input 
                                        value={contact.name} 
                                        onChange={(e) => handleContactChange(contact.id, 'name', e.target.value)}
                                        className="font-normal"
                                    />
                                    <Input 
                                        value={contact.phone} 
                                        onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)}
                                        className="font-normal"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="font-normal text-foreground/90">{contact.name}</p>
                                    <p className="font-normal text-foreground/90">{contact.phone}</p>
                                </>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
        
        <Separator />
        
        <div>
             <h2 className="text-3xl font-bold text-primary mb-6 text-center">Organizational Structure</h2>
             <OrganizationalChart />
        </div>

      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
