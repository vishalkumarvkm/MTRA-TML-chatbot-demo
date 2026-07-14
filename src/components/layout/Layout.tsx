"use client";

import { useEffect, useState } from "react";

import { AskAgentButton } from "@/components/chat/AskAgentButton";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProactiveAlert } from "@/components/chat/ProactiveAlert";
import { LogoLockup } from "@/components/ui/LogoLockup";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockNotifications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import {
  Activity,
  Bell,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FilePlus,
  FolderOpen,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Palette,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
    roles: ["employee", "admin"],
  },
  { label: "Apply Now", href: "/apply", icon: FilePlus, roles: ["employee"] },
  {
    label: "My Applications",
    href: "/applications",
    icon: FolderOpen,
    roles: ["employee", "admin"],
  },
  {
    label: "Manager Approvals",
    href: "/approvals",
    icon: CheckSquare,
    roles: ["manager", "admin"],
  },
  {
    label: "Application Status",
    href: "/notifications",
    icon: Bell,
    roles: ["employee", "admin"],
  },
  {
    label: "Scholarship Review",
    href: "/scholarship",
    icon: Trophy,
    roles: ["admin"],
  },
  {
    label: "Compliance Hub",
    href: "/compliance",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "Payroll Feed",
    href: "/payroll",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    label: "Case Management",
    href: "/cases/case-001",
    icon: FolderOpen,
    roles: ["admin"],
  },
  {
    label: "Policy Admin",
    href: "/admin/policy",
    icon: Settings,
    roles: ["admin"],
  },
  {
    label: "Support Cases",
    href: "/support",
    icon: MessageSquare,
    roles: ["employee", "manager", "admin"],
  },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  disableScroll?: boolean;
}

export function Layout({
  children,
  title,
  breadcrumbs,
  disableScroll = false,
}: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const {
    currentUser,
    isAuthenticated,
    logout,
    sidebarCollapsed,
    toggleSidebar,
    unreadNotificationCount,
    hasHydrated,
    isChatOpen,
  } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        if (pathname === "/") return;
        const searchStr =
          typeof window !== "undefined" ? window.location.search : "";
        const fullPath = pathname ? `${pathname}${searchStr}` : "";
        const queryParam =
          fullPath && fullPath !== "/"
            ? `?redirect=${encodeURIComponent(fullPath)}`
            : "";
        console.warn("Unauthenticated access attempt. Redirecting to login...");
        router.replace(`/login${queryParam}`);
        return;
      }

      // Find current item's required roles
      const activeItem = NAV_ITEMS.find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href + "/")),
      );

      if (activeItem?.roles) {
        if (!currentUser || !activeItem.roles.includes(currentUser.role)) {
          console.warn("Unauthorized access attempt. Redirecting...");
          if (currentUser?.role === "manager") {
            router.replace("/approvals");
          } else {
            router.replace("/");
          }
        }
      }
    }
  }, [hasHydrated, isAuthenticated, currentUser, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        toggleSidebar();
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // Only on mount

  useEffect(() => {
    if (theme !== "light") {
      setTheme("light");
    }
  }, [theme, setTheme]);

  if (!hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const _userNotifications = mockNotifications.filter(
    (n) =>
      !n.read &&
      (currentUser
        ? n.userId === mockNotifications.find((x) => x.userId)?.userId
        : true),
  );
  const unreadCount = unreadNotificationCount;

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    const userRole = currentUser?.role || "employee"; // Default to employee for guest visibility
    return item.roles.includes(userRole);
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      employee: "Employee",
      manager: "Manager",
      admin: "Administrator",
    };
    return map[role] ?? role;
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Header */}
      <header
        className="flex items-center justify-between bg-card border-b border-border h-16 px-4 sm:px-6 flex-shrink-0 z-30"
        data-ocid="header"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
            data-ocid="header.menu_button"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo brand lockup */}
          <LogoLockup />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 relative text-muted-foreground hover:text-foreground"
            aria-label={`Notifications (${unreadCount} unread)`}
            data-ocid="header.notifications_button"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2 text-sm font-medium text-foreground hover:bg-muted"
                data-ocid="header.user_menu"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {currentUser ? getInitials(currentUser.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block max-w-32 truncate">
                  {currentUser?.name ?? "Guest"}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-foreground">
                  {currentUser?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentUser?.email}
                </div>
                <Badge
                  variant="outline"
                  className="mt-1 text-[10px] px-1.5 py-0"
                >
                  {currentUser ? getRoleLabel(currentUser.role) : ""}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                data-ocid="header.profile_link"
              >
                <User className="w-4 h-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
                data-ocid="header.logout_button"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Welcome Banner (Overview page only) */}
      {pathname === "/" && (
        <div
          className="bg-[radial-gradient(ellipse_28%_260%_at_6%_55%,#1d6b74_0%,transparent_70%),radial-gradient(ellipse_30%_240%_at_22%_65%,#2d8a8f_0%,transparent_65%),radial-gradient(ellipse_34%_260%_at_58%_60%,#6fb0d6_0%,transparent_60%),radial-gradient(ellipse_28%_240%_at_94%_55%,#b9d3e6_0%,transparent_60%),linear-gradient(90deg,#1d6b74,#429ea6,#77b0d9,#d9e8f2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-12 py-6 sm:py-8 flex-shrink-0 border-b border-border"
          data-ocid="layout.welcome_banner"
        >
          <h1 className="text-white font-display font-medium text-xl sm:text-2xl md:text-3xl tracking-wide text-left">
            Welcome to the HealthyME Tuition Portal
          </h1>
          <Button
            onClick={() => router.push("/apply")}
            className="rounded-full bg-white text-[#003769] hover:bg-white/95 font-bold px-6 py-2.5 sm:py-3.5 shadow-sm shrink-0 w-full sm:w-auto text-center justify-center"
            data-ocid="layout.quick_apply_button"
          >
            Apply Now
          </Button>
        </div>
      )}

      {/* Main Body below Header */}
      <div
        className={cn(
          "flex flex-1 overflow-hidden transition-all duration-300 relative",
          isChatOpen && "xl:pr-[400px]",
        )}
      >
        {/* Sidebar Overlay for mobile */}
        {!sidebarCollapsed && isMobile && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden mt-[176px]"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0 z-20 h-full",
            isMobile
              ? sidebarCollapsed
                ? "-translate-x-full fixed top-16 bottom-0 left-0"
                : "w-64 translate-x-0 fixed top-16 bottom-0 left-0"
              : "w-64 translate-x-0",
          )}
          data-ocid="sidebar"
        >
          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5"
            aria-label="Main navigation"
          >
            {filteredNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  (pathname?.startsWith(item.href + "/") ||
                    item.href.split("/")[1] === pathname?.split("/")[1]));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-slate-500 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:text-slate-400 dark:hover:text-white",
                  )}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      sidebarCollapsed && isMobile ? "w-5 h-5" : "w-4 h-4",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-slate-400 group-hover:text-sidebar-accent-foreground dark:text-slate-500 dark:group-hover:text-white",
                    )}
                  />
                  {(!sidebarCollapsed || !isMobile) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {(!sidebarCollapsed || !isMobile) &&
                    item.badge &&
                    item.badge > 0 && (
                      <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-destructive text-destructive-foreground">
                        {item.badge}
                      </Badge>
                    )}
                </Link>
              );
            })}
          </nav>

          {/* User section at bottom */}
          {(!sidebarCollapsed || !isMobile) && (
            <div className="border-t border-border p-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {currentUser ? getInitials(currentUser.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {currentUser?.name ?? "Guest"}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {currentUser ? getRoleLabel(currentUser.role) : ""}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Page Content viewport */}
        <main
          className={cn(
            "flex-1 bg-white flex flex-col min-w-0",
            !disableScroll
              ? "overflow-y-auto px-4 sm:px-0"
              : "flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden",
          )}
          data-ocid="main_content"
        >
          <div
            className={cn(
              "flex-1 flex flex-col",
              disableScroll && "h-full min-h-0 overflow-hidden",
            )}
          >
            <div
              className={cn(
                "flex-1 flex flex-col min-h-0",
                !disableScroll && "pb-6",
              )}
            >
              {children}
            </div>
            {!disableScroll && pathname !== "/apply" && <FooterDisclaimer />}
          </div>
          {disableScroll && pathname !== "/apply" && <FooterDisclaimer />}
        </main>

        {/* Global AI Chat Agent */}
        <ProactiveAlert />
        <ChatButton />
        <ChatPanel />
      </div>
    </div>
  );
}

function FooterDisclaimer() {
  return (
    <footer className="w-full shrink-0 z-50">
      <div
        className="w-full text-center text-[11px] font-semibold flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: "#F59E0B",
          color: "#003769",
          padding: "6px 12px",
          fontFamily: "Arial, sans-serif",
          fontWeight: 600,
        }}
      >
        <span className="text-xs">⚠️</span>
        <span>DEMO BUILD — Sandbox environment. Data is for testing only.</span>
      </div>
    </footer>
  );
}
