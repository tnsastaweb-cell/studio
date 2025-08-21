
'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Loader2, Download } from 'lucide-react';
import { useLibrary, libraryCategories } from '@/services/library';
import { MOCK_SCHEMES } from '@/services/schemes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 px-0">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export default function LibraryPage() {
    const { libraryItems, loading } = useLibrary();
    const [selectedScheme, setSelectedScheme] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        return libraryItems.filter(item => {
            const schemeMatch = selectedScheme === 'all' ? true : item.scheme === selectedScheme;
            const categoryMatch = selectedCategory === 'all' ? true : item.category === selectedCategory;
            const searchMatch = searchTerm ? item.filename.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return schemeMatch && categoryMatch && searchMatch;
        });
    }, [libraryItems, selectedScheme, selectedCategory, searchTerm]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Resource Library</CardTitle>
                        <CardDescription>
                            Browse and download important documents, guidelines, and reports.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Scheme</label>
                                 <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Schemes</SelectItem>
                                        {MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {libraryCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="relative col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by filename..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                             </div>
                        </div>

                         <div className="border rounded-lg">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">S.No</TableHead>
                                        <TableHead>Filename</TableHead>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead className="text-center w-24">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                             <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                <span>Loading Library...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                <HighlightedText text={item.filename} highlight={searchTerm} />
                                            </TableCell>
                                             <TableCell>{item.scheme}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{format(new Date(item.uploadedAt), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{formatFileSize(item.size)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a 
                                                        href={item.dataUrl} 
                                                        download={item.filename}
                                                    >
                                                      <Download className="mr-2 h-4 w-4" /> Download
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                             No documents found. Try adjusting your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                           </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
