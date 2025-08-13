import Link from "next/link";
import { Mountain, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col items-start gap-4">
            <Link href="#" className="flex items-center gap-3" prefetch={false}>
              <div className="w-10 h-10 border-2 border-primary-foreground rounded-md flex items-center justify-center">
                <Mountain className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-impact text-2xl font-bold tracking-wider">SASTA</span>
                <span className="text-xs text-primary-foreground/80 font-semibold -mt-1">SOCIAL AUDIT UNIT OF TAMIL NADU</span>
              </div>
            </Link>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/80 font-normal">
               <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>SASTA, Chennai, Tamil Nadu</span>
               </div>
               <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 12345 67890</span>
               </div>
               <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@sasta.tn.gov.in</span>
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
            <h3 className="font-bold text-lg">Newsletter</h3>
            <p className="text-sm text-primary-foreground/80 font-normal">Subscribe to get the latest deals.</p>
            <form className="flex gap-2 mt-1">
              <Input type="email" placeholder="Enter your email" className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 font-normal" />
              <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-dotted border-white/30 text-center text-sm text-primary-foreground/70 font-normal">
          <p>&copy; {new Date().getFullYear()} Sasta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
