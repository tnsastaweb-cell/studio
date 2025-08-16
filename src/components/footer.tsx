
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFeedback } from '@/services/feedback';

const feedbackMessages = [
    "Feedback from John Doe: Great website, very informative!",
    "Feedback from Jane Smith: Found a small bug on the reports page.",
    "Feedback from Alex Ray: The new dashboard is a huge improvement.",
    "Feedback from Sam Wilson: Suggestion - add a search bar to the library.",
    "Feedback from Maria Garcia: The mobile view is very user-friendly."
];

const TamilNaduLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-full w-full">
        <path fill="#FFF" d="M256 0C114.615 0 0 114.615 0 256c0 141.385 114.615 256 256 256s256-114.615 256-256C512 114.615 397.385 0 256 0z"/>
        <path fill="#333" d="M256 41.5l20.4 63.8h67.1l-54.3 39.4 20.4 63.8-54.3-39.4-54.3 39.4 20.4-63.8-54.3-39.4h67.1z"/>
        <path fill="#000" stroke="#000" strokeWidth="2" d="M256 128.3c-70.6 0-128 57.4-128 128s57.4 128 128 128 128-57.4 128-128-57.4-128-128-128zm0 230.4c-56.5 0-102.4-45.9-102.4-102.4S199.5 154.7 256 154.7s102.4 45.9 102.4 102.4-45.9 102.4-102.4 102.4z"/>
        <text fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" textAnchor="middle" x="256" y="93.923" fill="#333">தமிழ் நாடு</text>
        <text fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" textAnchor="middle" x="256" y="446.404" fill="#333">வாய்மையே வெல்லும்</text>
    </svg>
);


export function Footer() {
  const { addFeedback } = useFeedback();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !feedback) {
        toast({
            title: "Error",
            description: "Please fill out all fields before submitting.",
            variant: "destructive",
        });
        return;
    }
    addFeedback({ name, email, feedback });
    setIsSubmitted(true);
    toast({
        title: "Success",
        description: "Thank you for your feedback!",
    });
    // Clear form
    setName("");
    setEmail("");
    setFeedback("");
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setFeedback("");
    setIsSubmitted(false);
  };

  useEffect(() => {
    if (isSubmitted) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % feedbackMessages.length);
      }, 40000); // 40 seconds

      return () => clearInterval(interval);
    }
  }, [isSubmitted]);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col items-start gap-4">
            <Link href="#" className="flex items-center gap-3" prefetch={false}>
              <div className="w-16 h-16 flex items-center justify-center">
                 <TamilNaduLogo />
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
                <span>Address: Panagal Maligai, Saidapet, Chennai - 600015, Tamil Nadu, India.</span>
               </div>
               <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone: 044-XXXX XXXX / 044-YYYY YYYY</span>
               </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <Link href="/" className="text-sm hover:underline font-normal" prefetch={false}>Home</Link>
            <Link href="/about" className="text-sm hover:underline font-normal" prefetch={false}>About Us</Link>
            <Link href="/schemes" className="text-sm hover:underline font-normal" prefetch={false}>Schemes</Link>
            <Link href="/gallery" className="text-sm hover:underline font-normal" prefetch={false}>Gallery</Link>
            <Link href="/sa-reports" className="text-sm hover:underline font-normal" prefetch={false}>SA Reports</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">User Actions</h3>
            <Link href="/grievances" className="text-sm hover:underline font-normal" prefetch={false}>Grievances</Link>
            <Link href="/registration" className="text-sm hover:underline font-normal" prefetch={false}>Registration</Link>
             <Link href="/data-entry" className="text-sm hover:underline font-normal" prefetch={false}>Data Entry</Link>
             <Link href="/reports" className="text-sm hover:underline font-normal" prefetch={false}>Reports</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Report an Issue or Share Feedback</h3>
            <p className="text-sm text-primary-foreground/80 font-normal">Your input helps us improve the SASTA portal.</p>
            <form className="flex flex-col gap-3 mt-1" onSubmit={handleSubmit}>
              <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white text-black placeholder:text-gray-500 font-normal" />
              <Input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-black placeholder:text-gray-500 font-normal" />
              <Textarea placeholder="Feedback / Issue Description*" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="bg-white text-black placeholder:text-gray-500 font-normal" />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCancel} className="hover:bg-primary-foreground/10 text-primary-foreground">Cancel</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Submit Feedback</Button>
              </div>
            </form>
             {isSubmitted && (
                <div className="mt-4 p-3 rounded-md bg-green-900/50 text-white relative h-12 overflow-hidden">
                    <div className="absolute inset-0 flex items-center transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${currentMessageIndex * 100}%)`}}>
                        {feedbackMessages.map((msg, index) => (
                             <p key={index} className="w-full text-center text-sm font-medium h-12 flex items-center justify-center shrink-0">{msg}</p>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-dotted border-white/30 text-center text-sm text-primary-foreground/70 font-normal">
          <p>&copy; {new Date().getFullYear()} Sasta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
