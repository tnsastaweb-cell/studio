import Link from "next/link";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-20 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <Link href="#" className="flex items-center justify-center gap-2" prefetch={false}>
        <Mountain className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-primary">SastaPage</span>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4 items-center">
        <Button asChild variant="link" className="text-primary hidden sm:inline-flex">
          <Link href="#" prefetch={false}>
            Admin Panel
          </Link>
        </Button>
        <Button variant="ghost" className="text-primary hover:bg-accent hover:text-accent-foreground">
          Sign In
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Sign Up
        </Button>
      </nav>
    </header>
  );
}
