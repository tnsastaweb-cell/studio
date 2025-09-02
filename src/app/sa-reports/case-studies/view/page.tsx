
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCaseStudies, CaseStudy } from '@/services/case-studies';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNavigation } from '@/components/main-navigation';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Loader2, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';

const CaseStudyViewer = ({ caseStudy }: { caseStudy: CaseStudy }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Case Study: {caseStudy.caseStudyNo}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm p-4 border rounded-lg">
                <div><strong>Scheme:</strong> {caseStudy.scheme}</div>
                <div><strong>District:</strong> {caseStudy.district}</div>
                <div><strong>Block:</strong> {caseStudy.block}</div>
                <div><strong>Panchayat:</strong> {caseStudy.panchayat}</div>
                <div><strong>BRP Name:</strong> {caseStudy.brpName || 'N/A'}</div>
                <div><strong>Employee Code:</strong> {caseStudy.employeeCode || 'N/A'}</div>
                <div><strong>Para No:</strong> {caseStudy.paraNo || 'N/A'}</div>
                <div><strong>Issue No:</strong> {caseStudy.issueNo || 'N/A'}</div>
            </div>

            <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">English</h3>
                        <p className="font-normal text-foreground/90 whitespace-pre-wrap">{caseStudy.descriptionEnglish}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Tamil</h3>
                        <p className="font-normal text-foreground/90 whitespace-pre-wrap">{caseStudy.descriptionTamil}</p>
                    </div>
                </CardContent>
            </Card>

            {caseStudy.tableData && caseStudy.tableData.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle>Data Table</CardTitle></CardHeader>
                    <CardContent>
                         <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableBody>
                                    {caseStudy.tableData.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {row.map((cell, colIndex) => (
                                                <TableCell key={colIndex} className="font-normal">{cell}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                 </Card>
            )}

            {caseStudy.photos && caseStudy.photos.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
                    <CardContent className={cn(
                        "grid gap-4",
                        caseStudy.photoLayout === 'a4-1' && "grid-cols-1",
                        caseStudy.photoLayout === 'a4-2' && "grid-cols-1 md:grid-cols-2",
                        caseStudy.photoLayout === 'a4-4' && "grid-cols-1 md:grid-cols-2",
                        caseStudy.photoLayout === 'a4-6' && "grid-cols-1 md:grid-cols-3",
                    )}>
                        {caseStudy.photos.map((photo, index) => (
                           <div key={index} className="space-y-2">
                               <div className="border rounded-lg overflow-hidden">
                                 <Image src={photo.dataUrl} alt={photo.description || `Photo ${index + 1}`} width={600} height={400} className="w-full h-auto object-contain" />
                               </div>
                               <p className="text-sm text-center text-muted-foreground">{photo.description}</p>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    );
};


export default function ViewCaseStudiesPage() {
    const { caseStudies, loading, deleteCaseStudy } = useCaseStudies();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);

    const canEdit = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

    const currentCaseStudy = useMemo(() => {
        if (caseStudies.length > 0) {
            return caseStudies[currentIndex];
        }
        return null;
    }, [caseStudies, currentIndex]);

    const handleNext = () => {
        if (currentIndex < caseStudies.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    
    const handleEdit = () => {
        if (currentCaseStudy) {
            router.push(`/sa-reports/case-studies/add?edit=${currentCaseStudy.caseStudyNo}`);
        }
    };

    const handleDelete = () => {
        if (currentCaseStudy) {
            deleteCaseStudy(currentCaseStudy.id);
            toast({ title: 'Case Study Deleted' });
            // Navigate to previous or reset index
            setCurrentIndex(prev => Math.max(0, prev -1));
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">Loading Case Studies...</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainNavigation />
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Case Study Reports</CardTitle>
                         <CardDescription>
                            Viewing case study {currentIndex + 1} of {caseStudies.length}.
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {caseStudies.length === 0 ? (
                             <div className="text-center text-muted-foreground py-16">
                                <p>No case studies have been submitted yet.</p>
                                 <Button className="mt-4" onClick={() => router.push('/sa-reports/case-studies/add')}>Add New Case Study</Button>
                             </div>
                        ) : (
                           <div className="space-y-6">
                               <div className="flex justify-between items-center">
                                 <div className="flex gap-2">
                                    <Button onClick={handlePrevious} disabled={currentIndex === 0}><ChevronLeft /> Previous</Button>
                                    <Button onClick={handleNext} disabled={currentIndex >= caseStudies.length - 1}>Next <ChevronRight /></Button>
                                 </div>
                                  {canEdit && currentCaseStudy && (
                                     <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => router.push('/sa-reports/case-studies/add')}><PlusCircle className="mr-2 h-4 w-4"/> Add New</Button>
                                        <Button variant="outline" onClick={handleEdit}><Edit className="mr-2 h-4 w-4"/> Edit</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this case study.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                     </div>
                                  )}
                               </div>
                               
                               {currentCaseStudy && <CaseStudyViewer caseStudy={currentCaseStudy} />}
                           </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
            <BottomNavigation />
        </div>
    );
}
