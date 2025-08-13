"use client";
import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const menuItems = [
  {
    title: "Men",
    subItems: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Footwear"],
  },
  {
    title: "Women",
    subItems: ["Dresses", "Tops", "Skirts", "Leggings", "Handbags"],
  },
  {
    title: "Kids",
    subItems: ["Boys' Clothing", "Girls' Clothing", "Toys", "Footwear"],
  },
  {
    title: "Home & Living",
    subItems: ["Bed Linen", "Home Decor", "Kitchen", "Storage", "Lighting"],
  },
  {
    title: "Beauty",
    subItems: ["Makeup", "Skincare", "Fragrances", "Hair Care"],
  },
];

export function MainNavigation() {
  return (
    <nav className="bg-secondary w-full flex justify-center py-2 shadow-md sticky top-[80px] z-40">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {menuItems.map((item) => (
          <DropdownMenu key={item.title}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-primary hover:bg-accent font-bold text-base px-4 py-2 flex items-center gap-1">
                {item.title}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-none shadow-lg mt-2">
              {item.subItems.map((subItem, subIndex) => (
                <React.Fragment key={subItem}>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="font-bold cursor-pointer focus:bg-accent">{subItem}</Link>
                  </DropdownMenuItem>
                  {subIndex < item.subItems.length - 1 && (
                    <DropdownMenuSeparator className="my-1 h-0 bg-transparent border-b border-dotted border-white" />
                  )}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </nav>
  );
}
