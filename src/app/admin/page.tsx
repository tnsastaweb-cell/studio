
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, differenceInYears, differenceInMonths, startOfMonth, endOfMonth, getDaysInMonth, getMonth, getYear, setMonth, setYear } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  Paperclip,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  User as UserIcon,
  ChevronsUpDown,
  Check,
  View,
  X,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { MOCK_MGNREGS_DATA } from '@/services/mgnregs';
import { MOCK_PANCHAYATS, Panchayat } from '@/services/panchayats';
import { MOCK_PMAYG_DATA } from '@/services/pmayg';
import { MOCK_SCHEMES, Scheme } from '@/services/schemes';
import { useCalendars } from '@/services/calendars';
import { DISTRICTS_WITH_CODES, DISTRICTS } from '@/services/district-offices';
import { useFeedback, Feedback } from '@/services/feedback';
import { useUsers, ROLES, User } from '@/services/users';
import { useVRPs, Vrp } from '@/services/vrp';
import { useGallery, galleryActivityTypes, GalleryMediaType, GalleryItem } from '@/services/gallery';
import { useLibrary, libraryCategories, LibraryItem, LibraryCategory } from '@/services/library';
import { useGrievances, Grievance, GrievanceStatus, GRIEVANCE_STATUSES } from '@/services/grievances';
import { useHlc, HlcItem } from '@/services/hlc';
import { useActivity, ActivityLog } from '@/services/activity';


import { cn } from '@/lib/utils';
import Image from 'next/image';

import { BottomNavigation } from '@/components/bottom-navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { MainNavigation } from '@/components/main-navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/hooks/use-auth';
import { useLogo } from '@/hooks/use-logo';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  employeeCode: z.string().min(1, { message: 'Employee code is required.' }),
  designation: z.enum(ROLES),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits.' }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const galleryFormSchema = z.object({
    mediaType: z.enum(["photo", "video", "news", "blog"]),
    district: z.string().min(1, "District is required."),
    block: z.string().min(1, "Block is required."),
    panchayat: z.string().min(1, "Panchayat is required."),
    scheme: z.string().min(1, "Scheme is required."),
    activityType: z.enum(galleryActivityTypes),
    isWorkRelated: z.enum(["yes", "no"]),
    workName: z.string().optional(),
    workCode: z.string().optional(),
    file: z.any().refine(fileList => fileList.length > 0, "File is required."),
}).refine(data => {
    if (data.isWorkRelated === 'yes') {
        return !!data.workName && !!data.workCode;
    }
    return true;
}, {
    message: "Work Name and Work Code are required when work related is 'Yes'",
    path: ["workName"],
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

const calendarFormSchema = z.object({
    scheme: z.string().min(1, "Scheme is required."),
    year: z.string().min(1, "Year is required."),
    district: z.string().min(1, "District is required."),
    type: z.enum(['Calendar', 'Other Letter']),
    file: z.any().refine(file => file?.length > 0, "File is required."),
});

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

const libraryFormSchema = z.object({
    scheme: z.string().min(1, "Scheme is required."),
    category: z.enum(libraryCategories),
    file: z.any().refine(file => file?.[0], "File is required."),
});

type LibraryFormValues = z.infer<typeof libraryFormSchema>;

const grievanceReplySchema = z.object({
    replyContent: z.string().min(10, "Reply must be at least 10 characters long."),
    status: z.enum(GRIEVANCE_STATUSES),
    attachment: z.any().optional(),
});
type GrievanceReplyValues = z.infer<typeof grievanceReplySchema>;

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const reportYears = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
const reportMonths = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM'),
}));


export default function AdminPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { vrps, deleteVrp } = useVRPs();
  const { feedbacks, deleteFeedback } = useFeedback();
  const { grievances, addReply, updateGrievanceStatus, deleteGrievance } = useGrievances();
  const { hlcItems, deleteHlc } = useHlc();
  const { activityLogs, clearMonthlyActivity } = useActivity();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [replyingToGrievance, setReplyingToGrievance] = useState<Grievance | null>(null);
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { logo, setLogo } = useLogo();
  const [logoPreview, setLogoPreview] = useState<string | null>(logo);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [panchayatCurrentPage, setPanchayatCurrentPage] = useState(1);
  const [panchayatsPerPage, setPanchayatsPerPage] = useState(100);
  const [panchayatFilters, setPanchayatFilters] = useState({
    district: '',
    block: '',
    panchayat: '',
    lgdCode: '',
  });

  const [staffFilters, setStaffFilters] = useState({
    search: '',
    role: 'all',
    district: 'all',
    employeeCodes: [] as string[],
  });
  
  const [vrpFilters, setVrpFilters] = useState({
      search: '',
      district: 'all',
      locationType: 'all',
  });
  
  const [hlcFilters, setHlcFilters] = useState({
      search: '',
      district: 'all',
  })

  const { calendars, addCalendar, deleteCalendar } = useCalendars();
  const { addItem: addGalleryItem } = useGallery();
  const { libraryItems, addLibraryItem, deleteLibraryItem } = useLibrary();

  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isReadyToUpload, setIsReadyToUpload] = useState(false);
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

  // S-MARS State
  const [marsFilters, setMarsFilters] = useState({
    search: '',
    district: 'all',
    role: 'all',
  });
  const [marsSelectedDate, setMarsSelectedDate] = useState(new Date());


  const filteredPanchayats = useMemo(() => {
    return MOCK_PANCHAYATS.filter(
      (p) =>
        p.district.toLowerCase().includes(panchayatFilters.district.toLowerCase()) &&
        p.block.toLowerCase().includes(panchayatFilters.block.toLowerCase()) &&
        p.name.toLowerCase().includes(panchayatFilters.panchayat.toLowerCase()) &&
        p.lgdCode.toString().includes(panchayatFilters.lgdCode)
    );
  }, [panchayatFilters]);

  const panchayatTotalPages = Math.ceil(filteredPanchayats.length / panchayatsPerPage);

  const paginatedPanchayats = useMemo(() => {
    const startIndex = (panchayatCurrentPage - 1) * panchayatsPerPage;
    const endIndex = startIndex + panchayatsPerPage;
    return filteredPanchayats.slice(startIndex, endIndex);
  }, [panchayatCurrentPage, panchayatsPerPage, filteredPanchayats]);
  
  const uniqueDistricts = useMemo(() => Array.from(new Set(MOCK_PANCHAYATS.map(p => p.district))).sort(), []);

    const filteredStaff = useMemo(() => {
        return users.filter(u => {
            const searchLower = staffFilters.search.toLowerCase();
            const roleMatch = staffFilters.role === 'all' || u.designation === staffFilters.role;
            const districtMatch = staffFilters.district === 'all' || u.district === staffFilters.district;
            const employeeMatch = staffFilters.employeeCodes.length === 0 || staffFilters.employeeCodes.includes(u.employeeCode);

            const searchMatch = !staffFilters.search ? true : (
                u.name.toLowerCase().includes(searchLower) ||
                u.employeeCode.toLowerCase().includes(searchLower) ||
                u.mobileNumber.includes(searchLower) ||
                (u.email || '').toLowerCase().includes(searchLower)
            );
            
            return roleMatch && districtMatch && employeeMatch && searchMatch;
        });
    }, [users, staffFilters]);
    
    const filteredVrps = useMemo(() => {
        return vrps.filter(vrp => {
            const searchLower = vrpFilters.search.toLowerCase();
            const districtMatch = vrpFilters.district === 'all' || vrp.district === vrpFilters.district;
            const locationMatch = vrpFilters.locationType === 'all' || (vrp.hasEmployeeCode === 'no' && vrp.locationType === vrpFilters.locationType);

            const searchMatch = !vrpFilters.search ? true : (
                vrp.name.toLowerCase().includes(searchLower) ||
                vrp.employeeCode.toLowerCase().includes(searchLower) ||
                vrp.contactNumber1.includes(searchLower) ||
                vrp.pfmsId.toLowerCase().includes(searchLower)
            );
            
            return districtMatch && locationMatch && searchMatch;
        });
    }, [vrps, vrpFilters]);
    
    const filteredHlcItems = useMemo(() => {
        return hlcItems.filter(item => {
            const districtMatch = hlcFilters.district === 'all' || item.district === hlcFilters.district;
            const searchLower = hlcFilters.search.toLowerCase();
            const searchMatch = !searchLower ? true : (
                item.regNo.toLowerCase().includes(searchLower) ||
                item.drpName.toLowerCase().includes(searchLower) ||
                item.proceedingNo.toLowerCase().includes(searchLower)
            );
            return districtMatch && searchMatch;
        })
    }, [hlcItems, hlcFilters]);


  const handlePanchayatFilterChange = (field: keyof typeof panchayatFilters, value: string) => {
    setPanchayatFilters((prev) => ({ ...prev, [field]: value }));
    setPanchayatCurrentPage(1);
  };

  const handlePanchayatsPerPageChange = (value: string) => {
    setPanchayatsPerPage(Number(value));
    setPanchayatCurrentPage(1);
  };

  const handleNextPanchayatPage = () => {
    setPanchayatCurrentPage((current) => Math.min(current + 1, panchayatTotalPages));
  };

  const handlePrevPanchayatPage = () => {
    setPanchayatCurrentPage((current) => Math.max(current - 1, 1));
  };

  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      employeeCode: '',
      mobileNumber: '',
      password: '',
      email: '',
    },
  });

  const handleDeleteUser = (userId: number) => {
    deleteUser(userId);
    toast({
      title: 'User Deleted',
      description: 'The user has been successfully deleted.',
    });
  };
  
    const handleEditUser = (user: User) => {
        router.push(`/registration/staff?edit=${user.employeeCode}`);
    };

  const handleAddNewUser = () => {
    setEditingUser(null);
    userForm.reset({
      name: '',
      employeeCode: '',
      designation: undefined,
      mobileNumber: '',
      dateOfBirth: undefined,
      email: '',
      password: 'password123', // Default password for new users
    });
    setIsFormOpen(true);
  };

  const onUserSubmit = (values: UserFormValues) => {
    if (editingUser) {
      updateUser({ ...editingUser, ...values, dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd') });
      toast({
        title: 'User Updated',
        description: 'The user details have been successfully updated.',
      });
    } else {
      addUser({
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
      });
      toast({
        title: 'User Added',
        description: 'The new user has been successfully created.',
      });
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PNG file.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveLogo = () => {
    if (logoPreview) {
      setLogo(logoPreview);
      toast({
        title: 'Logo Updated',
        description: 'The site logo has been changed successfully.',
      });
    }
  };
  
    // Gallery Form Logic
    const galleryForm = useForm<GalleryFormValues>({
        resolver: zodResolver(galleryFormSchema),
        defaultValues: {
            isWorkRelated: "no",
        }
    });
    
    const watchedDistrict = galleryForm.watch("district");
    const watchedBlock = galleryForm.watch("block");
    const watchedPanchayat = galleryForm.watch("panchayat");
    const watchedIsWorkRelated = galleryForm.watch("isWorkRelated");
    const watchedMediaType = galleryForm.watch("mediaType");

    const blocksForDistrict = useMemo(() => {
        if (!watchedDistrict) return [];
        return Array.from(new Set(MOCK_PANCHAYATS.filter(p => p.district === watchedDistrict).map(p => p.block))).sort();
    }, [watchedDistrict]);

    const panchayatsForBlock = useMemo(() => {
        if (!watchedBlock) return [];
        return MOCK_PANCHAYATS.filter(p => p.block === watchedBlock).sort((a, b) => a.name.localeCompare(b.name));
    }, [watchedBlock]);

    const selectedPanchayatLGD = useMemo(() => {
        if (!watchedPanchayat) return '';
        const panchayat = MOCK_PANCHAYATS.find(p => p.lgdCode === watchedPanchayat);
        return panchayat ? panchayat.lgdCode : '';
    }, [watchedPanchayat]);
    
    useEffect(() => {
        if (watchedDistrict) {
            galleryForm.setValue("block", "");
            galleryForm.setValue("panchayat", "");
        }
    }, [watchedDistrict, galleryForm]);

    useEffect(() => {
        if (watchedBlock) {
           galleryForm.setValue("panchayat", "");
        }
    }, [watchedBlock, galleryForm]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFilePreview(null);
        setGalleryFile(null);
        setIsReadyToUpload(false);
        if (!file) return;

        const mediaType = galleryForm.getValues("mediaType");
        
        // Validation logic
        if (mediaType === 'photo') {
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: 'destructive', title: "File too large", description: "Photo size must not exceed 5MB." });
                return;
            }
            const reader = new FileReader();
            reader.onload = (re) => {
                const img = new window.Image();
                img.src = re.target?.result as string;
                img.onload = () => {
                    if (img.width < img.height) {
                         toast({ variant: 'destructive', title: "Invalid Orientation", description: "Please upload landscape photos only." });
                    } else {
                        setFilePreview(img.src);
                        setGalleryFile(file);
                        setIsReadyToUpload(true); // Enable upload button after successful validation
                    }
                }
            };
            reader.readAsDataURL(file);
        } else if (mediaType === 'video') {
             if (file.size > 100 * 1024 * 1024) {
                toast({ variant: 'destructive', title: "File too large", description: "Video size must not exceed 100MB." });
                return;
            }
            setGalleryFile(file);
            setIsReadyToUpload(true);
        } else {
             setGalleryFile(file);
             setIsReadyToUpload(true);
        }
    }


    const handleGallerySubmit = (values: GalleryFormValues) => {
        if (!galleryFile) {
             toast({ variant: "destructive", title: "Upload Failed", description: "No valid file selected." });
             return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const panchayatInfo = MOCK_PANCHAYATS.find(p => p.lgdCode === values.panchayat);
            const newItem: Omit<GalleryItem, 'id' | 'uploadedAt'> = {
                ...values,
                originalFilename: galleryFile.name,
                dataUrl: dataUrl,
            };
            addGalleryItem(newItem);
            toast({ title: "Upload Successful", description: `${galleryFile.name} has been uploaded.` });
            
            setTimeout(() => {
                galleryForm.reset();
                if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
                setFilePreview(null);
                setGalleryFile(null);
                setIsReadyToUpload(false);
            }, 1000);
        };
        reader.readAsDataURL(galleryFile);
    };

    // Calendar Form Logic
    const calendarForm = useForm<CalendarFormValues>({
        resolver: zodResolver(calendarFormSchema),
    });

    const handleCalendarSubmit = (values: CalendarFormValues) => {
        const file = values.file?.[0];
        if (!file) {
            toast({ variant: 'destructive', title: 'File Missing', description: 'Please select a file to upload.' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newFilename = `${values.scheme}_${values.district}_${values.year}.pdf`;
            addCalendar({
                ...values,
                originalFilename: file.name,
                filename: newFilename,
                dataUrl: dataUrl,
            });
            toast({ title: 'Upload Successful', description: `${newFilename} has been uploaded.` });
            calendarForm.reset();
             if (calendarForm.control._fields.file?._f.ref) {
              (calendarForm.control._fields.file._f.ref as HTMLInputElement).value = '';
            }
        }
        reader.readAsDataURL(file);
    };

     // Library Form Logic
    const libraryForm = useForm<LibraryFormValues>({
        resolver: zodResolver(libraryFormSchema),
    });
    
    const handleLibrarySubmit = (values: LibraryFormValues) => {
        const file = values.file?.[0];
        if (!file) {
            toast({ variant: 'destructive', title: 'File Missing', description: 'Please select a file to upload.' });
            return;
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
             toast({ variant: 'destructive', title: "File too large", description: "File size must not exceed 100MB." });
             return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            addLibraryItem({
                ...values,
                filename: file.name,
                size: file.size,
                dataUrl: dataUrl,
            });
            toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });
            libraryForm.reset();
            if (libraryForm.control._fields.file?._f.ref) {
              (libraryForm.control._fields.file._f.ref as HTMLInputElement).value = '';
            }
        }
        reader.readAsDataURL(file);
    };

    const handleDeleteFeedback = (feedbackId: number) => {
        deleteFeedback(feedbackId);
        toast({ title: "Feedback Deleted", description: "The feedback has been removed." });
    };

    const grievanceReplyForm = useForm<GrievanceReplyValues>({
        resolver: zodResolver(grievanceReplySchema),
    });

    const handleReplyGrievance = (grievance: Grievance) => {
        setReplyingToGrievance(grievance);
        grievanceReplyForm.reset({
            replyContent: grievance.reply?.content || '',
            status: grievance.status,
            attachment: undefined,
        });
        setIsReplyFormOpen(true);
    };

    const onGrievanceReplySubmit = (values: GrievanceReplyValues) => {
        if (!replyingToGrievance || !user) return;
        
        const processSubmit = (attachmentData?: Grievance['reply']['attachment']) => {
            addReply(replyingToGrievance.id, values.replyContent, user.name, attachmentData);
            updateGrievanceStatus(replyingToGrievance.id, values.status);

            toast({ title: "Reply Sent", description: "The reply has been submitted successfully." });
            setIsReplyFormOpen(false);
            setReplyingToGrievance(null);
            setReplyAttachment(null);
        };
        
        if (replyAttachment) {
            const reader = new FileReader();
            reader.readAsDataURL(replyAttachment);
            reader.onloadend = () => {
                const attachmentData = {
                    name: replyAttachment.name,
                    type: replyAttachment.type,
                    size: replyAttachment.size,
                    dataUrl: reader.result as string,
                };
                processSubmit(attachmentData);
            };
            reader.onerror = () => {
                 toast({ variant: "destructive", title: "File Read Error", description: "Could not process the attachment file."});
            }
        } else {
            processSubmit(replyingToGrievance.reply?.attachment);
        }
    };
    
    const calculateExperience = (experience: any[]) => {
      if (!experience || experience.length === 0) return 'N/A';
      let totalMonths = 0;
      experience.forEach(exp => {
        const fromDate = new Date(exp.fromDate);
        const toDate = new Date(exp.toDate);
        totalMonths += differenceInMonths(toDate, fromDate);
      });
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      return `${years} years, ${months} months`;
    };


  // S-MARS Logic
  const marsReportData = useMemo(() => {
    const reportUsers = users.filter(u => ['BRP', 'DRP', 'DRP I/C'].includes(u.designation));

    const filteredReportUsers = reportUsers.filter(u => {
      const searchLower = marsFilters.search.toLowerCase();
      const searchMatch = marsFilters.search === '' ||
        u.name.toLowerCase().includes(searchLower) ||
        u.employeeCode.toLowerCase().includes(searchLower) ||
        u.mobileNumber.includes(searchLower);

      const districtMatch = marsFilters.district === 'all' || u.district === marsFilters.district;
      const roleMatch = marsFilters.role === 'all' || u.designation === marsFilters.role;

      return searchMatch && districtMatch && roleMatch;
    });

    const startDate = startOfMonth(marsSelectedDate);
    const endDate = endOfMonth(marsSelectedDate);

    return filteredReportUsers.map(u => {
      const userLogs = activityLogs.filter(log =>
        log.employeeCode === u.employeeCode &&
        new Date(log.timestamp) >= startDate &&
        new Date(log.timestamp) <= endDate
      );

      const dailyCounts = Array(getDaysInMonth(marsSelectedDate)).fill(0);
      userLogs.forEach(log => {
        const day = new Date(log.timestamp).getDate();
        dailyCounts[day - 1] += 1;
      });

      const total = dailyCounts.reduce((a, b) => a + b, 0);

      return {
        ...u,
        dailyCounts,
        total,
      };
    });
  }, [users, activityLogs, marsFilters, marsSelectedDate]);

  const handleDownloadExcel = () => {
    const dataForSheet = marsReportData.map((u, index) => {
      const rowData: { [key: string]: any } = {
        'SL NO': index + 1,
        'ROLE': u.designation,
        'DISTRICT': u.district,
        'NAME': u.name,
        'EMPLOYEE CODE': u.employeeCode,
        'CONTACT': u.mobileNumber,
      };
      u.dailyCounts.forEach((count, i) => {
        rowData[String(i + 1).padStart(2, '0')] = count > 0 ? count : '';
      });
      rowData['MONTHLY TOTAL'] = u.total;
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "S-MARS Report");
    XLSX.writeFile(workbook, `S-MARS-Report-${format(marsSelectedDate, 'yyyy-MM')}.xlsx`);
  };

  const handleClearData = () => {
    clearMonthlyActivity();
    toast({
        title: "Activity Data Cleared",
        description: "The activity logs for the current month have been cleared."
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <MainNavigation />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const canAccessAdminPanel = user && ['ADMIN', 'CREATOR', 'CONSULTANT'].includes(user.designation);

  if (!canAccessAdminPanel) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <MainNavigation />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-4">You do not have permission to view this page.</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainNavigation />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Panel - Master Data</h1>
            <Button asChild>
                <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
        </div>

        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
              setEditingUser(null);
              userForm.reset();
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? 'Update the details of the existing user.'
                      : 'Fill in the details to create a new user.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={userForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="employeeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TN-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date('1930-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? 'text' : 'password'} {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
         <Dialog open={isReplyFormOpen} onOpenChange={setIsReplyFormOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Reply to Grievance: {replyingToGrievance?.regNo}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <p><strong>From:</strong> {replyingToGrievance?.fromName}</p>
                    <p><strong>Subject:</strong> {replyingToGrievance?.subject}</p>
                    <Card>
                        <CardHeader><CardTitle>Grievance Content</CardTitle></CardHeader>
                        <CardContent className="whitespace-pre-wrap font-normal text-sm">
                           {replyingToGrievance?.content}
                        </CardContent>
                         {replyingToGrievance?.attachment && (
                            <div className="p-4 border-t">
                                <a href={replyingToGrievance.attachment.dataUrl} download={replyingToGrievance.attachment.name} className="text-primary hover:underline text-sm flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> Download Attachment
                                </a>
                            </div>
                        )}
                    </Card>
                     <Form {...grievanceReplyForm}>
                        <form onSubmit={grievanceReplyForm.handleSubmit(onGrievanceReplySubmit)} className="space-y-4 pt-4">
                            <FormField control={grievanceReplyForm.control} name="replyContent" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Reply</FormLabel>
                                    <FormControl><Textarea placeholder="Type your reply here..." {...field} className="min-h-32" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={grievanceReplyForm.control} name="attachment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Attach File (Optional)</FormLabel>
                                    <FormControl><Input type="file" onChange={(e) => {
                                        field.onChange(e.target.files);
                                        setReplyAttachment(e.target.files?.[0] || null);
                                    }} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <FormField control={grievanceReplyForm.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Update Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {GRIEVANCE_STATUSES.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )} />
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsReplyFormOpen(false)}>Cancel</Button>
                                <Button type="submit">Submit Reply</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
         </Dialog>

        <Tabs defaultValue="signup-details" className="w-full">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="signup-details">Sign Up Details</TabsTrigger>
            <TabsTrigger value="schemes">Schemes</TabsTrigger>
            <TabsTrigger value="local-bodies">Rural &amp; Urban</TabsTrigger>
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="hlc-details">HLC Details</TabsTrigger>
            <TabsTrigger value="s-mars">S-MARS</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="roles">
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
          </TabsContent>
          <TabsContent value="signup-details">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Add, edit, or delete user records. Total Users: {users.length}
                  </CardDescription>
                </div>
                <Button onClick={handleAddNewUser}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Employee Code</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.employeeCode}</TableCell>
                          <TableCell>{user.designation}</TableCell>
                          <TableCell>{user.mobileNumber}</TableCell>
                          <TableCell>{format(new Date(user.dateOfBirth), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.password}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user and
                                    remove their data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schemes">
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
                            <p>
                              <strong>Type:</strong> {scheme.type}
                            </p>
                            <p>
                              <strong>Category:</strong> {scheme.category}
                            </p>
                            <p>
                              <strong>Sub Category:</strong> {scheme.subCategory}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="local-bodies">
            <Tabs defaultValue="district-panchayats" className="w-full">
              <TabsList>
                <TabsTrigger value="district">District</TabsTrigger>
                <TabsTrigger value="panchayats">Panchayats</TabsTrigger>
                <TabsTrigger value="district-panchayats" disabled>
                  District Panchayat
                </TabsTrigger>
                <TabsTrigger value="corporations" disabled>
                  Corporation
                </TabsTrigger>
                <TabsTrigger value="municipalities" disabled>
                  Municipality
                </TabsTrigger>
                <TabsTrigger value="town-panchayats" disabled>
                  Town Panchayat
                </TabsTrigger>
              </TabsList>
               <TabsContent value="district">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>District List</CardTitle>
                                        <CardDescription>
                                            List of all Districts in Tamil Nadu. Total: {DISTRICTS_WITH_CODES.length}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[80px]">S.No</TableHead>
                                                        <TableHead>District Code</TableHead>
                                                        <TableHead>District Name</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {DISTRICTS_WITH_CODES.map((district, index) => (
                                                        <TableRow key={district.code}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{district.code}</TableCell>
                                                            <TableCell>{toTitleCase(district.name)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
              <TabsContent value="panchayats">
                <Card>
                  <CardHeader>
                    <CardTitle>Panchayat List</CardTitle>
                    <CardDescription>
                      List of all Panchayats with their respective codes and districts. Total:{' '}
                      {filteredPanchayats.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                      <Input
                          placeholder="Filter by District..."
                          value={panchayatFilters.district}
                          onChange={(e) => handlePanchayatFilterChange('district', e.target.value)}
                        />
                      <Input
                          placeholder="Filter by Block..."
                          value={panchayatFilters.block}
                          onChange={(e) => handlePanchayatFilterChange('block', e.target.value)}
                        />
                     <Input
                          placeholder="Filter by Panchayat..."
                          value={panchayatFilters.panchayat}
                          onChange={(e) => handlePanchayatFilterChange('panchayat', e.target.value)}
                        />
                      <Input
                          placeholder="Filter by LGD Code..."
                          value={panchayatFilters.lgdCode}
                          onChange={(e) => handlePanchayatFilterChange('lgdCode', e.target.value)}
                        />
                      <Button className="self-end">Get Reports</Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">S.No</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Block</TableHead>
                            <TableHead>Panchayat</TableHead>
                            <TableHead>LGD Code</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedPanchayats.map((item, index) => (
                            <TableRow key={item.lgdCode}>
                              <TableCell>
                                {(panchayatCurrentPage - 1) * panchayatsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{toTitleCase(item.district)}</TableCell>
                              <TableCell>{toTitleCase(item.block)}</TableCell>
                              <TableCell className="font-medium">{toTitleCase(item.name)}</TableCell>
                              <TableCell>{item.lgdCode}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                          value={String(panchayatsPerPage)}
                          onValueChange={handlePanchayatsPerPageChange}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 25, 50, 75, 100].map((val) => (
                              <SelectItem key={val} value={String(val)}>
                                {val}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Page {panchayatCurrentPage} of {panchayatTotalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={handlePrevPanchayatPage}
                            disabled={panchayatCurrentPage === 1}
                            variant="outline"
                            size="sm"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                          </Button>
                          <Button
                            onClick={handleNextPanchayatPage}
                            disabled={panchayatCurrentPage === panchayatTotalPages}
                            variant="outline"
                            size="sm"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="grievances">
            <Card>
              <CardHeader>
                <CardTitle>Grievance Management</CardTitle>
                <CardDescription>
                  Review, reply to, and manage user-submitted grievances.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reg. No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Attachments</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grievances.map(g => (
                            <TableRow key={g.id}>
                                <TableCell className="font-mono text-xs">{g.regNo}</TableCell>
                                <TableCell>{format(new Date(g.submittedAt), "dd/MM/yyyy")}</TableCell>
                                <TableCell className="font-medium">{g.isAnonymous ? "Anonymous" : g.fromName}</TableCell>
                                <TableCell>{g.subject}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        g.status === 'Resolved' ? 'default' : 
                                        g.status === 'Rejected' ? 'destructive' : 'secondary'
                                    }>{g.status}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    {g.attachment && <Paperclip className="h-4 w-4 mx-auto" />}
                                    {g.reply?.attachment && <Paperclip className="h-4 w-4 mx-auto text-primary" />}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button variant="outline" size="sm" onClick={() => handleReplyGrievance(g)}>
                                        <Edit className="mr-2 h-3 w-3"/>
                                        Reply
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete the grievance.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteGrievance(g.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="feedbacks">
            <Card>
              <CardHeader>
                <CardTitle>User Feedbacks</CardTitle>
                <CardDescription>
                  List of all submitted feedbacks from users. Total: {feedbacks.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbacks.map((feedback, index) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{feedback.name}</TableCell>
                          <TableCell>{feedback.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{feedback.type}</Badge>
                          </TableCell>
                          <TableCell className="text-left whitespace-pre-wrap text-foreground/80 font-normal">
                            {feedback.feedback}
                          </TableCell>
                          <TableCell>
                            {format(new Date(feedback.submittedAt), 'dd/MM/yyyy hh:mm a')}
                          </TableCell>
                          <TableCell className="text-right">
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this feedback.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteFeedback(feedback.id)}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details">
            <Tabs defaultValue="staff-details">
                <TabsList>
                    <TabsTrigger value="staff-details">Staff Details</TabsTrigger>
                    <TabsTrigger value="vrp-details">VRP</TabsTrigger>
                </TabsList>
                <TabsContent value="staff-details" className="pt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Staff Details</CardTitle>
                            <CardDescription>Manage and view registered staff members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                                <div className="relative lg:col-span-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input placeholder="Search by Name, Contact, Email..." className="pl-10" value={staffFilters.search} onChange={e => setStaffFilters(f => ({ ...f, search: e.target.value }))} />
                                </div>
                                <Select value={staffFilters.role} onValueChange={v => setStaffFilters(f => ({ ...f, role: v }))}>
                                    <SelectTrigger><SelectValue placeholder="All Roles"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                 <Select value={staffFilters.district} onValueChange={v => setStaffFilters(f => ({ ...f, district: v }))}>
                                    <SelectTrigger><SelectValue placeholder="All Districts"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-between">
                                            {staffFilters.employeeCodes.length > 0 ? `${staffFilters.employeeCodes.length} codes selected` : "Select Employee Code..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search Employee Code..." />
                                            <CommandEmpty>No employee found.</CommandEmpty>
                                            <CommandList>
                                                {users.map((u) => (
                                                    <CommandItem
                                                        key={u.employeeCode}
                                                        value={u.employeeCode}
                                                        onSelect={(currentValue) => {
                                                             setStaffFilters(f => {
                                                                const codes = f.employeeCodes;
                                                                const index = codes.indexOf(u.employeeCode);
                                                                if (index > -1) {
                                                                    codes.splice(index, 1);
                                                                } else {
                                                                    codes.push(u.employeeCode);
                                                                }
                                                                return {...f, employeeCodes: [...codes] };
                                                             })
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", staffFilters.employeeCodes.includes(u.employeeCode) ? "opacity-100" : "opacity-0")} />
                                                        {u.employeeCode}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="w-full overflow-x-auto relative">
                                <Table className="min-w-max">
                                    <TableHeader className="sticky top-0 bg-background z-20">
                                        <TableRow>
                                          <TableHead colSpan={6} className="text-center border-r">Basic Information</TableHead>
                                          <TableHead colSpan={4} className="text-center border-r">Location Details</TableHead>
                                          <TableHead colSpan={3} className="text-center border-r">Family Details</TableHead>
                                          <TableHead colSpan={7} className="text-center border-r">Personal Details</TableHead>
                                          <TableHead colSpan={11} className="text-center border-r">Personal Info</TableHead>
                                          <TableHead colSpan={3} className="text-center border-r">Education &amp; Experience</TableHead>
                                          <TableHead colSpan={4} className="text-center border-r">Working Details</TableHead>
                                          <TableHead colSpan={8} className="text-center border-r">Training &amp; Pilot Audit</TableHead>
                                          <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            {/* Basic */}
                                            <TableHead className="sticky left-0 bg-background z-10">S.No</TableHead>
                                            <TableHead className="sticky left-12 bg-background z-10">Name</TableHead>
                                            <TableHead>Photo</TableHead>
                                            <TableHead>Recruitment Type</TableHead>
                                            <TableHead>Employee Code</TableHead>
                                            <TableHead>Contact No</TableHead>
                                            {/* Location */}
                                            <TableHead>Type</TableHead>
                                            <TableHead>District/Block/Urban</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Pincode</TableHead>
                                            {/* Family */}
                                            <TableHead>Father's Name</TableHead>
                                            <TableHead>Mother's Name</TableHead>
                                            <TableHead>Spouse's Name</TableHead>
                                            {/* Personal */}
                                            <TableHead>Religion</TableHead>
                                            <TableHead>Caste</TableHead>
                                            <TableHead>DOB</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Differently Abled</TableHead>
                                            <TableHead>Health Issues</TableHead>
                                            {/* Personal Info */}
                                            <TableHead>Contact 2</TableHead>
                                            <TableHead>Email ID</TableHead>
                                            <TableHead>E-Portal Email</TableHead>
                                            <TableHead>PFMS ID</TableHead>
                                            <TableHead>Bank</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Account No</TableHead>
                                            <TableHead>IFSC</TableHead>
                                            <TableHead>Aadhaar</TableHead>
                                            <TableHead>PAN</TableHead>
                                            <TableHead>UAN</TableHead>
                                            {/* Edu &amp; Exp */}
                                            <TableHead>Qualification</TableHead>
                                            <TableHead>Experience</TableHead>
                                            <TableHead>Skills</TableHead>
                                            {/* Working */}
                                            <TableHead>Joining Date</TableHead>
                                            <TableHead>Worked Duration</TableHead>
                                            <TableHead>Present Duration</TableHead>
                                            <TableHead>DRP I/C</TableHead>
                                            {/* Training */}
                                            <TableHead>Training Taken</TableHead>
                                            <TableHead>Training Name</TableHead>
                                            <TableHead>Training Given</TableHead>
                                            <TableHead>Training Name</TableHead>
                                            <TableHead>Pilot Audit</TableHead>
                                            <TableHead>Scheme Name</TableHead>
                                            <TableHead>State Office</TableHead>
                                            <TableHead>Work Particulars</TableHead>
                                            {/* Actions */}
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStaff.map((staff, index) => {
                                            const lastCourse = staff.academicDetails?.[staff.academicDetails.length - 1]?.course || 'N/A';
                                            const totalExperience = calculateExperience(staff.workExperience || []);
                                            const skills = staff.skills?.map(s => s.skill).join(', ') || 'N/A';
                                            const presentStation = staff.designation === 'BRP' 
                                                ? staff.brpWorkHistory?.find(h => h.station === 'present')
                                                : staff.designation === 'DRP' || staff.designation === 'DRP I/C'
                                                ? staff.drpWorkHistory?.find(h => h.station === 'present')
                                                : null;

                                            return (
                                            <TableRow key={staff.id}>
                                                <TableCell className="sticky left-0 bg-background z-10">{index + 1}</TableCell>
                                                <TableCell className="font-medium sticky left-12 bg-background z-10">{staff.name}</TableCell>
                                                {/* Basic */}
                                                <TableCell>
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={staff.profilePicture || undefined} alt={staff.name}/>
                                                        <AvatarFallback><UserIcon /></AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>{staff.recruitmentType}</TableCell>
                                                <TableCell>{staff.employeeCode}</TableCell>
                                                <TableCell>{staff.mobileNumber}</TableCell>
                                                {/* Location */}
                                                <TableCell>{staff.locationType}</TableCell>
                                                <TableCell>
                                                    {staff.locationType === 'rural' ? `${staff.district}, ${staff.block}, ${staff.panchayatName}` : `${staff.district}, ${staff.urbanBodyType}, ${staff.urbanBodyName}`}
                                                </TableCell>
                                                <TableCell>{staff.fullAddress}</TableCell>
                                                <TableCell>{staff.pincode}</TableCell>
                                                {/* Family */}
                                                <TableCell>{staff.fatherName}</TableCell>
                                                <TableCell>{staff.motherName}</TableCell>
                                                <TableCell>{staff.spouseName}</TableCell>
                                                {/* Personal */}
                                                <TableCell>{staff.religion}</TableCell>
                                                <TableCell>{staff.caste}</TableCell>
                                                <TableCell>{staff.dateOfBirth ? format(new Date(staff.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{staff.age}</TableCell>
                                                <TableCell>{staff.gender} {staff.gender === 'female' && staff.femaleType ? `(${staff.femaleType})` : ''}</TableCell>
                                                <TableCell>{staff.isDifferentlyAbled}</TableCell>
                                                <TableCell>{staff.healthIssues}</TableCell>
                                                {/* Personal Info */}
                                                <TableCell>{staff.contactNumber2}</TableCell>
                                                <TableCell>{staff.emailId}</TableCell>
                                                <TableCell>{staff.eportalEmailId}</TableCell>
                                                <TableCell>{staff.pfmsId}</TableCell>
                                                <TableCell>{staff.bankName}</TableCell>
                                                <TableCell>{staff.branchName}</TableCell>
                                                <TableCell>{staff.accountNumber}</TableCell>
                                                <TableCell>{staff.ifscCode}</TableCell>
                                                <TableCell>{staff.aadhaar}</TableCell>
                                                <TableCell>{staff.pan}</TableCell>
                                                <TableCell>{staff.uan}</TableCell>
                                                {/* Edu &amp; Exp */}
                                                <TableCell>{lastCourse}</TableCell>
                                                <TableCell>{totalExperience}</TableCell>
                                                <TableCell>{skills}</TableCell>
                                                {/* Working */}
                                                <TableCell>{staff.joiningDate ? format(new Date(staff.joiningDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{/* Worked Duration - Placeholder */}</TableCell>
                                                <TableCell>{presentStation ? calculateExperience([presentStation]) : 'N/A'}</TableCell>
                                                <TableCell>{staff.workedAsDrpIc}</TableCell>
                                                {/* Training */}
                                                <TableCell>{staff.trainingTaken}</TableCell>
                                                <TableCell>{staff.trainingTakenDetails?.[0]?.trainingName || 'N/A'}</TableCell>
                                                <TableCell>{staff.trainingGiven}</TableCell>
                                                <TableCell>{staff.trainingGivenDetails?.[0]?.trainingName || 'N/A'}</TableCell>
                                                <TableCell>{staff.pilotAudit}</TableCell>
                                                <TableCell>{staff.pilotAuditDetails?.[0]?.schemeName || 'N/A'}</TableCell>
                                                <TableCell>{staff.stateOfficeActivities}</TableCell>
                                                <TableCell>{staff.stateOfficeActivitiesDetails?.[0]?.workParticulars || 'N/A'}</TableCell>
                                                {/* Actions */}
                                                 <TableCell className="space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEditUser(staff)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the staff record for {staff.name}.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(staff.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="vrp-details">
                    <Card>
                        <CardHeader>
                            <CardTitle>VRP Details</CardTitle>
                            <CardDescription>Manage and view registered Village Resource Persons.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <Input placeholder="Search by Name, Code, PFMS, Contact..." value={vrpFilters.search} onChange={e => setVrpFilters(f => ({ ...f, search: e.target.value }))} />
                                <Select value={vrpFilters.district} onValueChange={v => setVrpFilters(f => ({ ...f, district: v }))}>
                                    <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                 <Select value={vrpFilters.locationType} onValueChange={v => setVrpFilters(f => ({ ...f, locationType: v }))}>
                                    <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        <SelectItem value="rural">Rural</SelectItem>
                                        <SelectItem value="urban">Urban</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full overflow-x-auto relative">
                                <Table className="min-w-max">
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead>S.No</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Has Emp Code?</TableHead>
                                            <TableHead>Employee Code</TableHead>
                                            <TableHead>Scheme</TableHead>
                                            <TableHead>Job Card</TableHead>
                                            <TableHead>Location Type</TableHead>
                                            <TableHead>District</TableHead>
                                            <TableHead>Block</TableHead>
                                            <TableHead>Panchayat</TableHead>
                                            <TableHead>Urban Body</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Pincode</TableHead>
                                            <TableHead>Contact 1</TableHead>
                                            <TableHead>Contact 2</TableHead>
                                            <TableHead>Father/Husband</TableHead>
                                            <TableHead>Caste</TableHead>
                                            <TableHead>DOB</TableHead>
                                            <TableHead>Age</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Qualification</TableHead>
                                            <TableHead>PFMS ID</TableHead>
                                            <TableHead>Bank</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Account No</TableHead>
                                            <TableHead>IFSC</TableHead>
                                            <TableHead>Aadhaar</TableHead>
                                            <TableHead>PAN</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVrps.map((vrp, index) => (
                                            <TableRow key={vrp.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{vrp.name}</TableCell>
                                                <TableCell>{vrp.role}</TableCell>
                                                <TableCell>{vrp.hasEmployeeCode}</TableCell>
                                                <TableCell>{vrp.employeeCode}</TableCell>
                                                <TableCell>{vrp.hasEmployeeCode === 'no' ? vrp.scheme : 'MGNREGS'}</TableCell>
                                                <TableCell>{vrp.hasEmployeeCode === 'yes' ? vrp.mgnregaJobCard : 'N/A'}</TableCell>
                                                <TableCell>{vrp.hasEmployeeCode === 'no' ? vrp.locationType : 'rural'}</TableCell>
                                                <TableCell>{vrp.district}</TableCell>
                                                <TableCell>{vrp.block}</TableCell>
                                                <TableCell>{vrp.panchayatName}</TableCell>
                                                <TableCell>{vrp.hasEmployeeCode === 'no' && vrp.locationType === 'urban' ? `${vrp.urbanBodyType} - ${vrp.urbanBodyName}` : 'N/A'}</TableCell>
                                                <TableCell>{vrp.address}</TableCell>
                                                <TableCell>{vrp.pincode}</TableCell>
                                                <TableCell>{vrp.contactNumber1}</TableCell>
                                                <TableCell>{vrp.contactNumber2}</TableCell>
                                                <TableCell>{vrp.familyRelation}: {vrp.familyName}</TableCell>
                                                <TableCell>{vrp.caste}</TableCell>
                                                <TableCell>{format(new Date(vrp.dob), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>{vrp.age}</TableCell>
                                                <TableCell>{vrp.gender}</TableCell>
                                                <TableCell>{vrp.qualification}</TableCell>
                                                <TableCell>{vrp.pfmsId}</TableCell>
                                                <TableCell>{vrp.bankName}</TableCell>
                                                <TableCell>{vrp.branchName}</TableCell>
                                                <TableCell>{vrp.accountNumber}</TableCell>
                                                <TableCell>{vrp.ifscCode}</TableCell>
                                                <TableCell>{vrp.aadhaar}</TableCell>
                                                <TableCell>{vrp.pan}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => { /* handle edit */ }}>Edit</Button>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>Delete</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the VRP record.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteVrp(vrp.id)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </TabsContent>
        <TabsContent value="hlc-details">
             <Card>
                <CardHeader>
                    <CardTitle>HLC Details</CardTitle>
                    <CardDescription>Review and manage all submitted HLC entries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={MOCK_SCHEMES[0].id}>
                        <TabsList>
                             {MOCK_SCHEMES.map(scheme => (
                                <TabsTrigger key={scheme.id} value={scheme.id}>{scheme.name}</TabsTrigger>
                            ))}
                        </TabsList>
                        {MOCK_SCHEMES.map(scheme => (
                             <TabsContent key={scheme.id} value={scheme.id} className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="relative md:col-span-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search by Reg. No, DRP Name, Proceeding No..." 
                                            className="pl-10" 
                                            value={hlcFilters.search}
                                            onChange={(e) => setHlcFilters(f => ({ ...f, search: e.target.value }))}
                                        />
                                    </div>
                                     <Select value={hlcFilters.district} onValueChange={v => setHlcFilters(f => ({ ...f, district: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Districts</SelectItem>
                                            {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reg. No</TableHead>
                                                <TableHead>HLC Date</TableHead>
                                                <TableHead>District</TableHead>
                                                <TableHead>DRP Name</TableHead>
                                                <TableHead>Placed</TableHead>
                                                <TableHead>Closed</TableHead>
                                                <TableHead>Pending</TableHead>
                                                <TableHead>Recovered</TableHead>
                                                <TableHead className="text-center">FIR</TableHead>
                                                <TableHead className="text-center">Charges</TableHead>
                                                <TableHead className="text-center">Minutes</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredHlcItems.filter(item => item.scheme === scheme.name).map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs">{item.regNo}</TableCell>
                                                    <TableCell>{format(new Date(item.hlcDate), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{item.district}</TableCell>
                                                    <TableCell>{item.drpName}</TableCell>
                                                    <TableCell>{item.placedParas}</TableCell>
                                                    <TableCell>{item.closedParas}</TableCell>
                                                    <TableCell>{item.pendingParas}</TableCell>
                                                    <TableCell>{item.recoveredAmount ? `₹${item.recoveredAmount.toLocaleString()}` : '-'}</TableCell>
                                                    <TableCell className="text-center">{item.firNo || 'No'}</TableCell>
                                                    <TableCell className="text-center">{item.chargeDetails || 'No'}</TableCell>
                                                    <TableCell className="text-center">
                                                        {item.hlcMinutes && (
                                                            <a href={item.hlcMinutes.dataUrl} download={item.hlcMinutes.name} className="text-primary hover:underline">
                                                                <FileText className="h-5 w-5 mx-auto" />
                                                            </a>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="outline" size="sm">Edit</Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>Delete</Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>This will permanently delete this HLC entry.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteHlc(item.id)}>Continue</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                             </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="s-mars">
            <Card>
                <CardHeader>
                    <CardTitle>S-MARS - Smart Monthly Activity Report System</CardTitle>
                    <CardDescription>
                        Track daily activity for BRP, DRP, and DRP I/C roles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 p-4 border rounded-lg">
                        <Input 
                            placeholder="Search by Name, Code, Contact..." 
                            className="max-w-sm"
                            value={marsFilters.search}
                            onChange={e => setMarsFilters(f => ({ ...f, search: e.target.value }))}
                        />
                         <Select value={marsFilters.district} onValueChange={v => setMarsFilters(f => ({ ...f, district: v }))}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={marsFilters.role} onValueChange={v => setMarsFilters(f => ({ ...f, role: v }))}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="BRP">BRP</SelectItem>
                                <SelectItem value="DRP">DRP</SelectItem>
                                <SelectItem value="DRP I/C">DRP I/C</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select value={getYear(marsSelectedDate).toString()} onValueChange={v => setMarsSelectedDate(setYear(marsSelectedDate, parseInt(v)))}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                         </Select>
                          <Select value={getMonth(marsSelectedDate).toString()} onValueChange={v => setMarsSelectedDate(setMonth(marsSelectedDate, parseInt(v)))}>
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {reportMonths.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                            </SelectContent>
                         </Select>
                        <div className="flex-grow" />
                        <div className="flex gap-2">
                             <Button onClick={handleDownloadExcel}><Download className="mr-2" /> Download as Excel</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2" /> Clear Current Month Data</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will permanently delete all activity logs for the current month. This cannot be undone. Are you sure you want to proceed?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearData}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                    </div>
                     <div className="w-full overflow-x-auto border rounded-lg">
                        <Table>
                           <TableHeader>
                                <TableRow>
                                    <TableHead>SL NO</TableHead>
                                    <TableHead>ROLE</TableHead>
                                    <TableHead>DISTRICT</TableHead>
                                    <TableHead>NAME</TableHead>
                                    <TableHead>EMPLOYEE CODE</TableHead>
                                    <TableHead>CONTACT</TableHead>
                                    {Array.from({ length: getDaysInMonth(marsSelectedDate) }, (_, i) => i + 1).map(day => (
                                        <TableHead key={day} className="text-center">{String(day).padStart(2, '0')}</TableHead>
                                    ))}
                                    <TableHead className="text-right">MONTHLY TOTAL</TableHead>
                                </TableRow>
                           </TableHeader>
                            <TableBody>
                                {marsReportData.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.designation}</TableCell>
                                    <TableCell>{row.district}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.employeeCode}</TableCell>
                                    <TableCell>{row.mobileNumber}</TableCell>
                                    {row.dailyCounts.map((count, dayIndex) => (
                                    <TableCell key={dayIndex} className="text-center">
                                        {count > 0 ? count : ''}
                                    </TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold">{row.total}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>
          <TabsContent value="settings">
            <Tabs defaultValue="logo-upload" className="w-full">
               <TabsList className="grid w-full grid-cols-4">
                 <TabsTrigger value="logo-upload">Logo Upload</TabsTrigger>
                 <TabsTrigger value="gallery-upload">Gallery Upload</TabsTrigger>
                 <TabsTrigger value="calendar-upload">Calendar Upload</TabsTrigger>
                 <TabsTrigger value="library-upload">Library Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="logo-upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Logo</CardTitle>
                    <CardDescription>Manage global site settings, such as the logo.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-primary">Upload Logo</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a PNG file to be used as the site logo in the header and footer.
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={96}
                            height={96}
                            className="object-contain p-1"
                          />
                        ) : (
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/png"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose PNG File
                        </Button>
                        <Button onClick={handleSaveLogo} disabled={!logoPreview || logoPreview === logo}>
                          Save Logo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="gallery-upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery Upload</CardTitle>
                            <CardDescription>Upload new items to the gallery.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Form {...galleryForm}>
                                <form onSubmit={galleryForm.handleSubmit(handleGallerySubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <FormField control={galleryForm.control} name="mediaType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Media Type</FormLabel>
                                                <Select onValueChange={(value) => { field.onChange(value); setFilePreview(null); setGalleryFile(null); setIsReadyToUpload(false); }} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select media type" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="photo">Photo</SelectItem>
                                                        <SelectItem value="video">Video</SelectItem>
                                                        <SelectItem value="news">News Report</SelectItem>
                                                        <SelectItem value="blog">Blog</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={galleryForm.control} name="district" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>District</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField control={galleryForm.control} name="block" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Block</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedDistrict}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {blocksForDistrict.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={galleryForm.control} name="panchayat" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Panchayat</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!watchedBlock}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Panchayat" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {panchayatsForBlock.map(p => <SelectItem key={p.lgdCode} value={p.lgdCode}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <div className="space-y-2">
                                            <Label>LGD Code</Label>
                                            <Input value={selectedPanchayatLGD} readOnly className="bg-muted" />
                                         </div>
                                        <FormField control={galleryForm.control} name="scheme" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Scheme</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField control={galleryForm.control} name="activityType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Activity Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {galleryActivityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={galleryForm.control} name="isWorkRelated" render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Work Related?</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} value={field.value ?? "no"} className="flex space-x-4">
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {watchedIsWorkRelated === 'yes' && (
                                            <>
                                                <FormField control={galleryForm.control} name="workName" render={({ field }) => (
                                                    <FormItem><FormLabel>Work Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={galleryForm.control} name="workCode" render={({ field }) => (
                                                    <FormItem><FormLabel>Work Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </>
                                        )}
                                        <FormField control={galleryForm.control} name="file" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Upload File</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        ref={galleryFileInputRef}
                                                        type="file" 
                                                        accept={
                                                            watchedMediaType === 'photo' ? 'image/jpeg, image/png' :
                                                            watchedMediaType === 'video' ? 'video/mp4, video/avi, video/mov' : '*'
                                                        }
                                                        onChange={(e) => {
                                                            field.onChange(e.target.files);
                                                            handleFileChange(e);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         {filePreview && watchedMediaType === 'photo' && (
                                            <div className="col-span-full">
                                                <Label>Photo Preview</Label>
                                                <div className="mt-2 p-4 border-2 border-dashed border-primary rounded-lg flex justify-center items-center bg-muted/30">
                                                    <Image src={filePreview} alt="Preview" width={400} height={300} className="rounded-md object-contain max-h-64" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={!isReadyToUpload}>
                                      <Upload className="mr-2" />
                                      Upload
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
              </TabsContent>
              <TabsContent value="calendar-upload">
                  <Card>
                      <CardHeader>
                          <CardTitle>Calendar Upload</CardTitle>
                          <CardDescription>Upload new audit calendars.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <Form {...calendarForm}>
                              <form onSubmit={calendarForm.handleSubmit(handleCalendarSubmit)} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                      <FormField control={calendarForm.control} name="scheme" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Scheme</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                  <FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl>
                                                  <SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={calendarForm.control} name="year" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Year</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                  <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                                                  <SelectContent>{reportYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={calendarForm.control} name="district" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>District</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {DISTRICTS_WITH_CODES.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={calendarForm.control} name="type" render={({ field }) => (
                                           <FormItem className="space-y-3">
                                                <FormLabel>Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-2 pt-2">
                                                        <FormItem className="flex items-center space-x-1"><FormControl><RadioGroupItem value="Calendar" /></FormControl><FormLabel className="font-normal text-xs">Calendar</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-1"><FormControl><RadioGroupItem value="Other Letter" /></FormControl><FormLabel className="font-normal text-xs">Other Letter</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                      )} />
                                      <FormField control={calendarForm.control} name="file" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Upload PDF</FormLabel>
                                              <FormControl><Input type="file" accept=".pdf" onChange={e => field.onChange(e.target.files)} /></FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                  </div>
                                  <Button type="submit">Upload Calendar</Button>
                              </form>
                          </Form>
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-primary mb-2">Uploaded Calendars</h3>
                             <div className="border rounded-lg max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Scheme</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>District</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {calendars.map(cal => (
                                    <TableRow key={cal.id}>
                                      <TableCell className="font-medium">{cal.filename}</TableCell>
                                      <TableCell>{cal.scheme}</TableCell>
                                      <TableCell>{cal.year}</TableCell>
                                      <TableCell>{cal.district}</TableCell>
                                      <TableCell className="text-right">
                                          <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>Delete</Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                  <AlertDialogDescription>This will permanently delete the calendar file.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => deleteCalendar(cal.id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                      </CardContent>
                  </Card>
              </TabsContent>
               <TabsContent value="library-upload">
                  <Card>
                      <CardHeader>
                          <CardTitle>Library Upload</CardTitle>
                          <CardDescription>Upload new documents to the library.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                           <Form {...libraryForm}>
                              <form onSubmit={libraryForm.handleSubmit(handleLibrarySubmit)} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                      <FormField control={libraryForm.control} name="scheme" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Scheme</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                  <FormControl><SelectTrigger><SelectValue placeholder="Select Scheme" /></SelectTrigger></FormControl>
                                                  <SelectContent>{MOCK_SCHEMES.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                      <FormField control={libraryForm.control} name="category" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Category</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                  <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                                                  <SelectContent>{libraryCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                       <FormField control={libraryForm.control} name="file" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Upload File</FormLabel>
                                              <FormControl><Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.png,.jpg,.jpeg,.psd,.zip,.rar" onChange={e => field.onChange(e.target.files)} /></FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )} />
                                  </div>
                                  <Button type="submit">Upload Document</Button>
                              </form>
                           </Form>
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-primary mb-2">Uploaded Library Items</h3>
                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Filename</TableHead>
                                            <TableHead>Scheme</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Size (KB)</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {libraryItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.filename}</TableCell>
                                            <TableCell>{item.scheme}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{(item.size / 1024).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" disabled={!canAccessAdminPanel}>Delete</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the library file.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteLibraryItem(item.id)}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </div>
                      </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}
