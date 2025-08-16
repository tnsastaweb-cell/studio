
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
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <g clipPath="url(#clip0_103_2)">
        <path d="M256 512C397.385 512 512 397.385 512 256C512 114.615 397.385 0 256 0C114.615 0 0 114.615 0 256C0 397.385 114.615 512 256 512Z" fill="url(#paint0_linear_103_2)"/>
        <path d="M379.051 216.596H132.949C136.038 203.805 140.346 191.404 145.728 179.523L256 139.923L366.272 179.523C371.654 191.404 375.962 203.805 379.051 216.596Z" fill="#F0F0F0"/>
        <path d="M349.179 265.846V177.667L256 142.769L162.821 177.667V265.846H349.179Z" fill="#FF9933"/>
        <path d="M349.179 309.949V265.846H162.821V309.949H349.179Z" fill="#F0F0F0"/>
        <path d="M349.179 354.051V309.949H162.821V354.051H349.179Z" fill="#138808"/>
        <path d="M256 302.256C263.869 302.256 270.256 295.869 270.256 288C270.256 280.131 263.869 273.744 256 273.744C248.131 273.744 241.744 280.131 241.744 288C241.744 295.869 248.131 302.256 256 302.256Z" fill="#000080"/>
        <path d="M256 299.846C262.544 299.846 267.846 294.544 267.846 288C267.846 281.456 262.544 276.154 256 276.154C249.456 276.154 244.154 281.456 244.154 288C244.154 294.544 249.456 299.846 256 299.846Z" fill="#F0F0F0"/>
        <path d="M256 284.103C258.209 284.103 260 285.894 260 288.103C260 290.312 258.209 292.103 256 292.103C253.791 292.103 252 290.312 252 288.103C252 285.894 253.791 284.103 256 284.103Z" fill="#000080"/>
        <path d="M256 276.513C256.26 276.513 256.513 276.26 256.513 276C256.513 275.74 256.26 275.487 256 275.487C255.74 275.487 255.487 275.74 255.487 276C255.487 276.26 255.74 276.513 256 276.513Z" fill="#D80027"/>
        <path d="M256 388.513C241.385 388.513 229.487 376.615 229.487 362.001C229.487 347.386 241.385 335.488 256 335.488C270.615 335.488 282.513 347.386 282.513 362.001C282.513 376.615 270.615 388.513 256 388.513ZM247.179 350.719H264.821V345.309H247.179V350.719ZM247.179 361.668H264.821V356.258H247.179V361.668ZM247.179 372.616H264.821V367.206H247.179V372.616Z" fill="#D80027"/>
        <path d="M256 276.513C256.26 276.513 256.513 276.26 256.513 276C256.513 275.74 256.26 275.487 256 275.487C255.74 275.487 255.487 275.74 255.487 276C255.487 276.26 255.74 276.513 256 276.513Z" fill="#D80027"/>
        <path d="M280.41 402.103C274.804 403.526 265.714 403.503 255.949 403.503C245.222 403.503 238.932 402.181 236.615 402.181C225.215 402.181 217.179 406.781 217.179 406.781C227.479 409.881 243.085 410.103 255.897 410.103C272.827 410.103 280.824 405.003 280.824 405.003C280.824 405.003 282.537 402.346 280.41 402.103Z" fill="#D80027"/>
        <path d="M256 278.41C255.448 278.41 255 278.858 255 279.41V296.59C255 297.142 255.448 297.59 256 297.59C256.552 297.59 257 297.142 257 296.59V279.41C257 278.858 256.552 278.41 256 278.41Z" fill="#000080"/>
        <path d="M258.828 279.123L257.768 280.183L241.436 288.016L240.961 286.893L257.293 279.06L258.354 278.001L258.828 279.123Z" fill="#000080"/>
        <path d="M262.756 281.434L261.85 281.936L247.123 293.076L246.544 291.996L261.272 280.856L262.177 280.354L262.756 281.434Z" fill="#000080"/>
        <path d="M265.64 285.28L264.839 285.88L252.613 299.366L251.91 298.243L264.136 284.757L264.937 284.157L265.64 285.28Z" fill="#000080"/>
        <path d="M266.942 289.947L266.213 290.649L257.054 305.903L256.241 305.44L265.4 290.186L266.129 289.484L266.942 289.947Z" fill="#000080"/>
        <path d="M266.828 294.819L266.308 295.694L260.301 312.639L259.395 312.302L265.402 295.357L265.922 294.482L266.828 294.819Z" fill="#000080"/>
        <path d="M265.122 299.141L264.759 300.123L262.383 318.001L261.397 317.864L263.773 299.986L264.136 299.004L265.122 299.141Z" fill="#000080"/>
        <path d="M253.172 279.123L254.232 280.183L270.564 288.016L271.039 286.893L254.707 279.06L253.646 278.001L253.172 279.123Z" fill="#000080"/>
        <path d="M249.244 281.434L250.15 281.936L264.877 293.076L265.456 291.996L250.728 280.856L249.823 280.354L249.244 281.434Z" fill="#000080"/>
        <path d="M246.36 285.28L247.161 285.88L259.387 299.366L260.09 298.243L247.864 284.757L247.063 284.157L246.36 285.28Z" fill="#000080"/>
        <path d="M245.058 289.947L245.787 290.649L254.946 305.903L255.759 305.44L246.6 290.186L245.871 289.484L245.058 289.947Z" fill="#000080"/>
        <path d="M245.172 294.819L245.692 295.694L251.699 312.639L252.605 312.302L246.598 295.357L246.078 294.482L245.172 294.819Z" fill="#000080"/>
        <path d="M246.878 299.141L247.241 300.123L249.617 318.001L250.603 317.864L248.227 299.986L247.864 299.004L246.878 299.141Z" fill="#000080"/>
        <path d="M256 287.538C257.381 287.538 258.513 286.407 258.513 285C258.513 283.593 257.381 282.462 256 282.462C254.619 282.462 253.487 283.593 253.487 285C253.487 286.407 254.619 287.538 256 287.538Z" fill="#000080"/>
        <text fill="white" xmlSpace="preserve" style={{whiteSpace: "pre"}} fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" letterSpacing="0em"><tspan x="180.898" y="93.923">தமிழ் நாடு</tspan></text>
        <text fill="white" xmlSpace="preserve" style={{whiteSpace: "pre"}} fontFamily="Lohit Tamil" fontSize="48" fontWeight="bold" letterSpacing="0em"><tspan x="100.898" y="446.404">வாய்மையே வெல்லும்</tspan></text>
        </g>
        <defs>
        <linearGradient id="paint0_linear_103_2" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
        <stop stopColor="#006A4E"/>
        <stop offset="1" stopColor="#006A4E"/>
        </linearGradient>
        <clipPath id="clip0_103_2">
        <rect width="512" height="512" fill="white"/>
        </clipPath>
        </defs>
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
