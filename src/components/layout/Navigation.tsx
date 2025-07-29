"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchModal } from "@/components/common/SearchModal";
import { UserMenu } from "@/components/layout/UserMenu";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Menu, Search, Shield, Newspaper, Video, Microscope, Scale, Brain } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Function to get background gradient classes for each section
const getBackgroundGradient = (color: string) => {
  switch (color) {
    case 'tory':
      return 'bg-gradient-to-b from-blue-500/20 to-blue-700/20';
    case 'today':
      return 'bg-gradient-to-b from-purple-500/20 to-purple-700/20';
    case 'science':
      return 'bg-gradient-to-b from-green-500/20 to-green-700/20';
    case 'law':
      return 'bg-gradient-to-b from-red-500/20 to-red-700/20';
    case 'playground':
      return 'bg-gradient-to-b from-purple-500/20 to-purple-700/20';
    default:
      return 'bg-gradient-to-b from-gray-500/20 to-gray-700/20';
  }
};

// Function to get icon for each section
const getSectionIcon = (color: string) => {
  switch (color) {
    case 'tory':
      return Newspaper;
    case 'today':
      return Video;
    case 'science':
      return Microscope;
    case 'law':
      return Scale;
    case 'playground':
      return Brain;
    default:
      return Newspaper;
  }
};

const navigationItems = [
  {
    title: "Triton Tory",
    href: "/triton-tory",
    description: "Campus news, sports, and student life coverage",
    color: "tory",
    items: [
      { title: "Latest News", href: "/triton-tory", description: "Most recent campus updates" },
      { title: "Sports", href: "/triton-tory?category=Sports", description: "Athletic news and highlights" },
      { title: "Student Government", href: "/triton-tory?category=Student Government", description: "Campus politics and policies" },
      { title: "Events", href: "/triton-tory?category=Events", description: "Campus events and activities" },
    ],
  },
  {
    title: "Triton Today",
    href: "/triton-today",
    description: "Short-form video content and campus updates",
    color: "today",
    items: [
      { title: "Latest Videos", href: "/triton-today", description: "Recent video content" },
      { title: "Campus Life", href: "/triton-today?category=Campus", description: "Day-to-day campus experiences" },
      { title: "Interviews", href: "/triton-today?category=Interview", description: "Student and faculty interviews" },
      { title: "Events Coverage", href: "/triton-today?category=Events", description: "Live event coverage" },
    ],
  },
  {
    title: "Science Journal",
    href: "/triton-science",
    description: "Research news and scientific discoveries",
    color: "science",
    items: [
      { title: "Latest Research", href: "/triton-science", description: "Recent scientific publications" },
      { title: "Faculty Research", href: "/triton-science?type=faculty", description: "Professor-led research projects" },
      { title: "Student Research", href: "/triton-science?type=student", description: "Undergraduate research highlights" },
      { title: "Departments", href: "/triton-science/departments", description: "Research by academic department" },
    ],
  },
  {
    title: "Law Review",
    href: "/triton-law",
    description: "Legal analysis and policy commentary",
    color: "law",
    items: [
      { title: "Latest Analysis", href: "/triton-law", description: "Recent legal commentary" },
      { title: "Campus Policy", href: "/triton-law?category=Campus", description: "University policy analysis" },
      { title: "Supreme Court", href: "/triton-law?category=Supreme Court", description: "High court decisions" },
      { title: "Student Rights", href: "/triton-law?category=Student Rights", description: "Student legal issues" },
    ],
  },
  {
    title: "Playground",
    href: "/playground",
    description: "Interactive personality and political tests",
    color: "playground",
  },
  {
    title: "About",
    href: "/about",
    description: "Learn about our team and mission",
    color: "tory",
  },
];

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  
  // Check if we're on a playground page
  const isPlaygroundPage = pathname?.startsWith('/playground');

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if it's a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) return; // Disable keyboard shortcuts on mobile

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isSearchOpen) {
          setIsSearchOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/75 mobile-gpu-accelerated">
        <div className="container flex h-16 items-center px-4">
          {/* Logo */}
          <div className="mr-8">
            <Logo variant="default" size="sm" href="/" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            "bg-transparent hover:bg-gray-800 data-[state=open]:bg-gray-800",
                            pathname.startsWith(item.href) && "text-primary"
                          )}
                        >
                          <Link href={item.href} className="no-underline">
                            {item.title}
                          </Link>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <div className="row-span-3">
                              <NavigationMenuLink asChild>
                                <Link
                                  className={cn(
                                    "flex h-full w-full select-none flex-col justify-between rounded-md p-6 no-underline outline-none focus:shadow-md",
                                    getBackgroundGradient(item.color)
                                  )}
                                  href={item.href}
                                >
                                  {/* Icon centered in the middle */}
                                  <div className="flex justify-center items-center flex-1">
                                    {(() => {
                                      const IconComponent = getSectionIcon(item.color);
                                      return <IconComponent className="h-8 w-8 text-white/80" />;
                                    })()}
                                  </div>
                                  
                                  {/* Content at the bottom */}
                                  <div>
                                    <div className="text-lg font-medium mb-2">
                                      {item.title}
                                    </div>
                                    <p className="text-sm leading-tight text-gray-400">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </div>
                            <div className="grid gap-1">
                              {item.items && item.items.map((subItem) => (
                                <NavigationMenuLink key={subItem.title} asChild>
                                  <Link
                                    href={subItem.href}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-800 focus:bg-gray-800"
                                  >
                                    <div className="text-sm font-medium leading-none">
                                      {subItem.title}
                                    </div>
                                    <p className="line-clamp-2 text-sm leading-snug text-gray-400">
                                      {subItem.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "block select-none rounded-md px-4 py-2 text-sm font-medium leading-none no-underline outline-none transition-colors hover:bg-gray-800 focus:bg-gray-800",
                            pathname.startsWith(item.href) && "text-primary"
                          )}
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center w-64 h-9 px-3 py-2 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1"></span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-600 bg-gray-700 px-1.5 font-mono text-[10px] font-medium text-gray-300">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>

            {/* Admin Portal Button */}
            {isAdmin() && (
              <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Portal
                </Link>
              </Button>
            )}

            {/* User Menu */}
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center space-x-2 ml-auto">
            {/* Mobile Search Bar - Made wider and more accessible */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center w-48 h-10 px-3 py-2 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mobile-touch-target"
            >
              <Search className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="flex-1 text-left">Search...</span>
            </button>

            {/* Mobile User Menu */}
            <UserMenu />

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white mobile-touch-target h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] bg-black border-gray-800 mobile-gpu-accelerated p-0">
                <div className="flex flex-col h-full">
                  {/* Header Section */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TT</span>
                      </div>
                      <div>
                        <h2 className="text-white font-semibold text-lg">Menu</h2>
                        <p className="text-gray-400 text-xs">Triton Tory Media</p>
                      </div>
                    </div>
                  </div>

                  {/* Search Section */}
                  <div className="p-4 border-b border-gray-800">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="flex items-center w-full h-12 px-4 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors mobile-touch-target"
                    >
                      <Search className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="flex-1 text-left">Search articles, videos, research...</span>
                    </button>
                  </div>

                  {/* Main Navigation */}
                  <div className="flex-1 py-4">
                    <div className="space-y-6">
                      {/* Primary Sections */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                          Main Sections
                        </h3>
                        <div className="space-y-1">
                          {navigationItems.map((item) => (
                            <div key={item.title} className="px-4">
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center justify-between py-3 px-3 rounded-lg transition-colors mobile-touch-target group",
                                  pathname.startsWith(item.href) 
                                    ? "bg-primary/20 text-primary border border-primary/30" 
                                    : "text-white hover:bg-gray-800/50"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    pathname.startsWith(item.href) 
                                      ? "bg-primary/20" 
                                      : "bg-gray-800/50 group-hover:bg-gray-700/50"
                                  )}>
                                    {(() => {
                                      const IconComponent = getSectionIcon(item.color);
                                      return <IconComponent className="h-4 w-4 text-white" />;
                                    })()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.description}</div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="border-t border-gray-800 p-4 space-y-3">
                    {/* Admin Portal */}
                    {isAdmin() && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 py-3 px-3 rounded-lg bg-purple-900/20 text-purple-300 hover:bg-purple-900/30 transition-colors mobile-touch-target border border-purple-800/30"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        <div>
                          <div className="font-medium text-sm">Admin Portal</div>
                          <div className="text-xs text-purple-400">Manage content & settings</div>
                        </div>
                      </Link>
                    )}

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // Add your settings logic here
                        }}
                        className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-800/50 text-gray-300 hover:bg-gray-800 transition-colors rounded-lg mobile-touch-target"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          // Add your help logic here
                        }}
                        className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-800/50 text-gray-300 hover:bg-gray-800 transition-colors rounded-lg mobile-touch-target"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help
                      </button>
                    </div>

                    {/* Version Info */}
                    <div className="text-center text-xs text-gray-500 pt-2">
                      Triton Tory Media v1.0
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        isPlaygroundSearch={isPlaygroundPage}
      />
    </>
  );
}
