
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
      <path fill="#006A4E" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/>
      <path fill="#FFFFFF" d="M256 472A216 216 0 1 0 256 40a216 216 0 1 0 0 432z"/>
      <path fill="#006A4E" d="M256 464a208 208 0 1 0 0-416 208 208 0 1 0 0 416z"/>
      <path fill="#FFFFFF" d="M374.2 214.4c-3.1-12.8-7.4-25.2-12.8-37.1l-105.3-39.6-105.4 39.6c-5.4 11.9-9.7 24.3-12.8 37.1h236.3z"/>
      <path fill="#FF9933" d="m162.9 177.3 93.1-34.9 93.1 34.9v88.2H162.9v-88.2z"/>
      <path fill="#FFFFFF" d="m162.9 265.5h186.2v44.1H162.9z"/>
      <path fill="#138808" d="m162.9 309.6h186.2v44.1H162.9z"/>
      <circle fill="#000080" cx="256" cy="287.5" r="14.7"/>
      <circle fill="#FFFFFF" cx="256" cy="287.5" r="12.7"/>
      <circle fill="#000080" cx="256" cy="287.5" r="4"/>
      <g fill="#000080">
          <path d="M256 276.3c-6.2 0-11.2 5-11.2 11.2s5 11.2 11.2 11.2 11.2-5 11.2-11.2-5-11.2-11.2-11.2zm0 20.4c-5.1 0-9.2-4.1-9.2-9.2s4.1-9.2 9.2-9.2 9.2 4.1 9.2 9.2-4.1 9.2-9.2 9.2z"/>
          <path d="M256 278.4h-1v18.3h1zM258.8 279.1l-1 1-16.3 7.8.5 1.1 16.3-7.8zM262.8 281.4l-.9-.5-14.7 11.1.6.8 14.7-11.1zM265.6 285.3l-.8-.6-12.2 13.5.7.6 12.2-13.5zM266.9 289.9l-.7-.7-9.2 15.3.8.5 9.2-15.3zM266.8 294.8l-.5-.9-6 16.9.9.3 6-16.9zM265.1 299.1l-.4-1-2.4 17.9 1 .1 2.4-17.9zM253.2 279.1l-16.3-7.8.5-1.1 16.3 7.8zM249.2 281.4l-14.7-11.1.6-.8 14.7 11.1zM246.4 285.3l-12.2-13.5.7-.6 12.2 13.5zM245.1 289.9l-9.2-15.3.8-.5 9.2 15.3zM245.2 294.8l-6-16.9.9-.3 6 16.9zM246.9 299.1l-2.4-17.9 1-.1 2.4 17.9zM256 287.5m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"/>
      </g>
      <path fill="#D22F27" d="M256 376.1c-14.6 0-26.5-11.9-26.5-26.5s11.9-26.5 26.5-26.5 26.5 11.9 26.5 26.5-11.9 26.5-26.5 26.5zm-8.8-37.4h17.5v-5.4h-17.5v5.4zm0 10.9h17.5v-5.4h-17.5v5.4zm0 10.9h17.5v-5.4h-17.5v5.4z"/>
      <path fill="#D22F27" d="M256 376.1c-14.6 0-26.5-11.9-26.5-26.5s11.9-26.5 26.5-26.5 26.5 11.9 26.5 26.5-11.9 26.5-26.5 26.5zm-8.8-37.4h17.5v-5.4h-17.5v5.4zm0 10.9h17.5v-5.4h-17.5v5.4zm0 10.9h17.5v-5.4h-17.5v5.4z"/>
      <path d="M280.4 402s-5.6 1.4-10.3 1.4c-4.2 0-11-1.3-14-1.3-11.4 0-19.4 4.6-19.4 4.6s10.3 3.1 23.1 3.1c16.9 0 24.9-5.1 24.9-5.1s-2.1-2.7-4.3-2.7z" fill="#D22F27"/>
      <text x="256" y="88" fontFamily="Lohit Tamil" fontSize="48" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">தமிழ் நாடு</text>
      <text x="256" y="440" fontFamily="Lohit Tamil" fontSize="48" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">வாய்மையே வெல்லும்</text>
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
