
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_SCHEMES, Scheme } from '@/services/schemes';
import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';

export function SchemesTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Scheme Management</CardTitle>
                <CardDescription>Details of all the schemes available in the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={MOCK_SCHEMES[0]?.id} className="w-full flex-col">
                    <TabsList>
                        {MOCK_SCHEMES.map((scheme) => (
                            <TabsTrigger key={scheme.id} value={scheme.id}>
                                {scheme.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {MOCK_SCHEMES.map((scheme) => (
                        <TabsContent key={scheme.id} value={scheme.id}>
                            {scheme.name === 'MGNREGS' ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{scheme.name} Details</CardTitle>
                                        <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Sub Category</TableHead>
                                                        <TableHead>Code Number</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {MOCK_MGNREGS_DATA.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.type}</TableCell>
                                                            <TableCell>{item.category}</TableCell>
                                                            <TableCell>{item.subCategory}</TableCell>
                                                            <TableCell>{item.codeNumber}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : scheme.name === 'PMAY-G' ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{scheme.name} Details</CardTitle>
                                        <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Sub Category</TableHead>
                                                        <TableHead>Code Number</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {MOCK_PMAYG_DATA.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.type}</TableCell>
                                                            <TableCell>{item.category}</TableCell>
                                                            <TableCell>{item.subCategory}</TableCell>
                                                            <TableCell>{item.codeNumber}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{scheme.name}</CardTitle>
                                        <CardDescription>Scheme Code: {scheme.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p><strong>Type:</strong> {scheme.type}</p>
                                        <p><strong>Category:</strong> {scheme.category}</p>
                                        <p><strong>Sub Category:</strong> {scheme.subCategory}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
