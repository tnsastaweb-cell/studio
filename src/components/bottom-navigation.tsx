import Link from "next/link";
import { Home, LayoutGrid, MessageSquare, User } from "lucide-react";
import { Button } from "./ui/button";

export function BottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="#" className="flex flex-col items-center gap-1 text-primary p-2 rounded-md hover:bg-accent" prefetch={false}>
          <Home className="h-6 w-6" />
          <span className="text-xs font-bold">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center gap-1 text-primary p-2 rounded-md hover:bg-accent" prefetch={false}>
          <LayoutGrid className="h-6 w-6" />
          <span className="text-xs font-bold">Categories</span>
        </Link>
        <Link href="#" className="flex flex-col items-center gap-1 text-primary p-2 rounded-md hover:bg-accent" prefetch={false}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs font-bold">Messages</span>
        </Link>
        <Link href="#" className="flex flex-col items-center gap-1 text-primary p-2 rounded-md hover:bg-accent" prefetch={false}>
          <User className="h-6 w-6" />
          <span className="text-xs font-bold">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
