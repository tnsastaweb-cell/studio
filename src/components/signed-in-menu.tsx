
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LayoutDashboard, FileText, Zap } from "lucide-react";

const menuItems = [
    { title: "AT A GLANCE", icon: <BarChart3 className="h-8 w-8 text-primary" /> },
    { title: "DASHBOARD", icon: <LayoutDashboard className="h-8 w-8 text-primary" /> },
    { title: "MIS REPORTS", icon: <FileText className="h-8 w-8 text-primary" /> },
    { title: "QUICK ACCESS", icon: <Zap className="h-8 w-8 text-primary" /> },
];

export function SignedInMenu() {
    return (
        <Card className="rounded-lg shadow-md bg-card">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {menuItems.map((item) => (
                        <Button key={item.title} variant="ghost" className="flex flex-col items-center justify-center h-auto p-4 gap-2 rounded-lg hover:bg-accent hover:text-accent-foreground">
                            {item.icon}
                            <span className="font-semibold text-primary text-sm">{item.title}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
