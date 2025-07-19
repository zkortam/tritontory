"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Newspaper,
  Video,
  Microscope,
  Scale,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Database,
  AlertTriangle,
  Trophy
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Triton Tory",
    href: "/admin/articles",
    icon: Newspaper,
    color: "text-tory-500",
    children: [
      { title: "All Articles", href: "/admin/articles" },
      { title: "Create Article", href: "/admin/articles/create" },
      { title: "Categories", href: "/admin/articles/categories" },
    ],
  },
  {
    title: "Triton Today",
    href: "/admin/videos",
    icon: Video,
    color: "text-today-500",
    children: [
      { title: "All Videos", href: "/admin/videos" },
      { title: "Upload Video", href: "/admin/videos/upload" },
      { title: "Categories", href: "/admin/videos/categories" },
    ],
  },
  {
    title: "Science Journal",
    href: "/admin/research",
    icon: Microscope,
    color: "text-science-500",
    children: [
      { title: "All Research", href: "/admin/research" },
      { title: "Create Research", href: "/admin/research/create" },
      { title: "Departments", href: "/admin/research/departments" },
    ],
  },
  {
    title: "Law Review",
    href: "/admin/legal",
    icon: Scale,
    color: "text-law-500",
    children: [
      { title: "All Articles", href: "/admin/legal" },
      { title: "Create Article", href: "/admin/legal/create" },
      { title: "Categories", href: "/admin/legal/categories" },
    ],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "News Tickers",
    href: "/admin/news-tickers",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    title: "Sports Banner",
    href: "/admin/sports-banner",
    icon: Trophy,
    color: "text-green-500",
  },
  {
    title: "Firebase Status",
    href: "/admin/firebase-status",
    icon: Database,
  },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle expandable sections
  const toggleExpand = (title: string) => {
    setExpanded(expanded === title ? null : title);
  };

  // Check if a nav item or any of its children are active
  const isActive = (item: typeof navItems[0]) => {
    if (pathname === item.href) return true;

    if (item.children) {
      return item.children.some((child: { href: string }) => pathname === child.href);
    }

    return false;
  };

  const sidebarContent = (
    <>
      <div className="px-4 py-6">
        <Logo variant="default" size="sm" />
        <div className="mt-2 text-xs text-gray-400">Admin Portal</div>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              // Expandable nav item
              <div>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                    isActive(item)
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white",
                    item.color
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expanded === item.title ? "rotate-180" : ""
                    )}
                  />
                </button>

                {/* Submenu */}
                {expanded === item.title && (
                  <div className="mt-1 space-y-1 pl-10">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium",
                          pathname === child.href
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Regular nav item
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  item.color
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto px-3 py-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-40 block rounded-md bg-gray-900 p-2 text-white md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-30 transform bg-gray-900/80 backdrop-blur-sm transition-all md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className="h-full w-64 transform bg-gray-900 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-y-auto">{sidebarContent}</div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 flex-shrink-0 bg-gray-900 md:block">
        <div className="flex h-full flex-col overflow-y-auto">{sidebarContent}</div>
      </div>
    </>
  );
}
