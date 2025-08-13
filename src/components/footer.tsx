import Link from "next/link";
import { Mountain, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col items-start gap-4">
            <Link href="#" className="flex items-center gap-2" prefetch={false}>
              <Mountain className="h-8 w-8" />
              <span className="text-2xl font-bold">SastaPage</span>
            </Link>
            <p className="text-sm text-primary-foreground/80 font-normal">
              Quality products at affordable prices. Your one-stop shop for everything you need.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>About Us</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Contact</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>FAQ</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Shipping & Returns</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg">Shop</h3>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Men</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Women</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Kids</Link>
            <Link href="#" className="text-sm hover:underline font-normal" prefetch={false}>Home</Link>
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
          <p>&copy; {new Date().getFullYear()} SastaPage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
