
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LayoutDashboard, FileText, Zap } from "lucide-react";

const menuItems = [
    { title: "AT A GLANCE", icon: <BarChart3 className="h-8 w-8 text-primary" />, href: "#" },
    { title: "DASHBOARD", icon: <LayoutDashboard className="h-8 w-8 text-primary" />, href: "/dashboard" },
    { title: "MIS REPORTS", icon: <FileText className="h-8 w-8 text-primary" />, href: "/sa-reports/mis-reports" },
    { title: "QUICK ACCESS", icon: <Zap className="h-8 w-8 text-primary" />, href: "#" },
];

export function QuickAccessMenu() {
    return (
        <Card className="rounded-lg shadow-md bg-card">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {menuItems.map((item) => (
                         <Button key={item.title} variant="ghost" asChild className="flex flex-col items-center justify-center h-auto p-4 gap-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                            <Link href={item.href}>
                                {item.icon}
                                <span className="font-semibold text-primary text-sm">{item.title}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
