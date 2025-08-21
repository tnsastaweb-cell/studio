
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Upload } from 'lucide-react';
import { useLogo } from '@/hooks/use-logo';

export function Footer() {
  const { logo } = useLogo();
  
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="flex flex-col items-start gap-4">
            <Link href="#" className="flex items-center gap-3" prefetch={false}>
              <div className="w-16 h-16 flex items-center justify-center">
                 {logo ? (
                    <Image src={logo} alt="Sasta logo" width={64} height={64} className="object-contain" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-impact text-2xl font-bold tracking-wider">SASTA</span>
                <span className="text-xs text-primary-foreground/80 font-semibold -mt-1">SOCIAL AUDIT UNIT OF TAMIL NADU</span>
              </div>
            </Link>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/80 font-normal">
               <h3 className="font-bold text-lg text-primary-foreground">Office Address & Contact</h3>
               <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span>Address: Social Audit Society of Tamil Nadu, Panagal Maligai, 2nd Floor, Saidapet, Chennai – 600 015.</span>
               </div>
               <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone: 044-24322152</span>
               </div>
                <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Toll Free: 1800-4252-152</span>
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <Link href="/" className="text-sm hover:underline font-normal" prefetch={false}>Home</Link>
            <Link href="/about" className="text-sm hover:underline font-normal" prefetch={false}>About Us</Link>
            <Link href="/schemes" className="text-sm hover:underline font-normal" prefetch={false}>Schemes</Link>
            <Link href="/gallery" className="text-sm hover:underline font-normal" prefetch={false}>Gallery</Link>
            <Link href="/library" className="text-sm hover:underline font-normal" prefetch={false}>Library</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">User Actions</h3>
            <Link href="/grievances" className="text-sm hover:underline font-normal" prefetch={false}>Grievances</Link>
            <Link href="/registration/district-office" className="text-sm hover:underline font-normal" prefetch={false}>Registration</Link>
             <Link href="/connect/write-to-us" className="text-sm hover:underline font-normal" prefetch={false}>Write to Us</Link>
             <Link href="/admin" className="text-sm hover:underline font-normal" prefetch={false}>Admin Panel</Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-dotted border-white/30 text-center text-sm text-primary-foreground/70 font-normal">
          <p>&copy; {new Date().getFullYear()} Sasta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
