
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { Phone } from 'lucide-react';

interface Contact {
  id: number;
  role: string;
  name: string;
  phone: string;
}

const initialPageContent = {
    intro1: "The Social Audit Society of Tamil Nadu was established under the Tamil Nadu Societies Registration Act, 1975, as approved by Government to facilitate conduct of Social Audit by Grama Sabhas to ensure proper implementation of Mahatma Gandhi National Rural Employment Guarantee Scheme in Tamil Nadu.",
    intro2: "Now the scope of Social Audit Society of Tamil Nadu has been extended to other Schemes like Pradhan Mantri Awaas Yojana – G (PMAY – G), 15th Central Finance Commission Grants, Mid Day Meal / PT. M.G.R. Nutritious Meal Programme, Social Justice - Grant-in-Aid Institutions etc., The main objective of Social Audit Society of Tamil Nadu is to create continuous public vigilance to ensure accountability in the implementation of various Schemes.",
    objectives: [
        "Promotes both organisational and public participation in social programmes.",
        "Makes the development programme more successful and efficient.",
        "Ensures proper financial management in accordance with the budget.",
        "Prevents the misuse of both funds and authority."
    ],
    overview: "The Social Audit Society of Tamil Nadu (SASTA) is a state-level autonomous institution under the Department of Rural Development and Panchayat Raj. It is dedicated to promoting transparency and accountability through community-led audits for schemes like MGNREGS and PMAY-G.",
    mission: "To ensure inclusive governance by empowering communities to audit and evaluate the delivery of public schemes through participatory processes.",
    vision: "A governance ecosystem where every citizen plays a role in upholding accountability, integrity, and equitable development.",
    address: "Social Audit Society of Tamil Nadu, Panagal Maligai, 2nd Floor, Saidapet, Chennai – 600 015.",
    phone: "044-24322152",
    tollFree: "1800-4252-152",
    emails: [
        "sasta.accts@gmail.com",
        "sasta.audit@gmail.com",
        "sadirectorate@gmail.com",
        "sasta.report@gmail.com",
        "sadirectorate.mis@gmail.com",
        "sasta.accounts@gmail.com"
    ]
};


export const initialContacts: Contact[] = [
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
  const [content, setContent] = useState(initialPageContent);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const { toast } = useToast();
  
  const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = () => {
    setIsEditing(false);
    toast({
        title: "Saved!",
        description: "The page content has been updated.",
    });
  };
  
  const handleCancel = () => {
    setContent(initialPageContent);
    setContacts(initialContacts);
    setIsEditing(false);
  }

  const handleContentChange = (field: keyof typeof initialPageContent, value: string | string[]) => {
      setContent(current => ({ ...current, [field]: value }));
  }

  const handleContactChange = (id: number, field: 'name' | 'phone', value: string) => {
    setContacts(currentContacts =>
      currentContacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Social Audit Unit</h1>
                <p className="text-lg text-muted-foreground">Social Audit Society of Tamil Nadu (SASTA)</p>
            </div>
             {!loading && canEdit && (
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </>
                    ) : (
                        <Button onClick={handleEditToggle}>Edit Page</Button>
                    )}
                </div>
            )}
        </div>
        
        <Card>
            <CardContent className="pt-6 space-y-4 font-normal text-foreground/90">
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea value={content.intro1} onChange={(e) => handleContentChange('intro1', e.target.value)} className="h-24" />
                        <Textarea value={content.intro2} onChange={(e) => handleContentChange('intro2', e.target.value)} className="h-32" />
                    </div>
                ) : (
                    <>
                    <p>{content.intro1}</p>
                    <p>{content.intro2}</p>
                    </>
                )}
            </CardContent>
        </Card>

         <Card>
            <CardHeader><CardTitle>Objectives of Social Audit</CardTitle></CardHeader>
            <CardContent className="font-normal text-foreground/90">
                 {isEditing ? (
                    <Textarea
                        value={content.objectives.join('\n')}
                        onChange={(e) => handleContentChange('objectives', e.target.value.split('\n'))}
                        className="h-32"
                    />
                 ) : (
                    <ul className="list-disc pl-6 space-y-2">
                        {content.objectives.map((obj, index) => <li key={index}>{obj}</li>)}
                    </ul>
                 )}
            </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader><CardTitle>A Brief Overview</CardTitle></CardHeader>
                    <CardContent className="text-foreground/90 font-normal">
                         {isEditing ? (
                            <Textarea value={content.overview} onChange={(e) => handleContentChange('overview', e.target.value)} className="h-28" />
                         ) : (
                            <p>{content.overview}</p>
                         )}
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Mission</CardTitle></CardHeader>
                        <CardContent className="text-foreground/90 font-normal">
                            {isEditing ? (
                                <Textarea value={content.mission} onChange={(e) => handleContentChange('mission', e.target.value)} className="h-28" />
                            ) : (
                                <p>{content.mission}</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Vision</CardTitle></CardHeader>
                        <CardContent className="text-foreground/90 font-normal">
                            {isEditing ? (
                                <Textarea value={content.vision} onChange={(e) => handleContentChange('vision', e.target.value)} className="h-28" />
                            ) : (
                                <p>{content.vision}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Office Address & Contact</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-foreground/90 font-normal">
                         {isEditing ? (
                            <div className="space-y-2">
                                <Textarea value={content.address} onChange={(e) => handleContentChange('address', e.target.value)} placeholder="Address" className="h-24" />
                                <Input value={content.phone} onChange={(e) => handleContentChange('phone', e.target.value)} placeholder="Phone"/>
                                <Input value={content.tollFree} onChange={(e) => handleContentChange('tollFree', e.target.value)} placeholder="Toll Free"/>
                            </div>
                         ) : (
                            <>
                                <p><strong>Address:</strong> {content.address}</p>
                                <p><strong>Phone:</strong> {content.phone}</p>
                                <p><strong>Toll Free:</strong> {content.tollFree}</p>
                            </>
                         )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Emails</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm text-foreground/90 font-normal break-all">
                        {isEditing ? (
                            <Textarea
                                value={content.emails.join('\n')}
                                onChange={(e) => handleContentChange('emails', e.target.value.split('\n'))}
                                className="h-40"
                            />
                        ) : (
                            content.emails.map(email => <p key={email}>{email}</p>)
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-primary">Structure of Social Audit Unit (Who is Who)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map(contact => (
                    <Card key={contact.id} className="border-dotted">
                        <CardContent className="p-4 space-y-1">
                             <p className="font-bold text-primary text-lg">{contact.role}</p>
                            {isEditing ? (
                                <div className="space-y-2 pt-1">
                                    <Input value={contact.name} onChange={(e) => handleContactChange(contact.id, 'name', e.target.value)} className="font-normal" />
                                    <Input value={contact.phone} onChange={(e) => handleContactChange(contact.id, 'phone', e.target.value)} className="font-normal" />
                                </div>
                            ) : (
                                <>
                                    <p className="font-normal text-foreground/90">{contact.name}</p>
                                    <div className="flex items-center gap-2 font-normal text-foreground/90">
                                        <Phone className="h-4 w-4" />
                                        <span>{contact.phone}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
