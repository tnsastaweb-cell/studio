
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES } from '@/services/users';

export function RolesTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                    These are the predefined roles available across the application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                        <Badge key={role} variant="secondary" className="text-lg">
                            {role}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
