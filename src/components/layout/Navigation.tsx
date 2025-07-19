"use client";

import { useState } from "react";
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
import { Menu, Search, Shield, Newspaper, Video, Microscope, Scale } from "lucide-react";
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
            {/* Mobile Search Bar */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center w-40 h-9 px-3 py-2 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <Search className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="flex-1"></span>
            </button>

            {/* Mobile User Menu */}
            <UserMenu />

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-black border-gray-800 mobile-gpu-accelerated">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <div key={item.title} className="space-y-2">
                      <Link
                        href={item.href}
                        className={cn(
                          "block text-lg font-medium hover:text-primary transition-colors",
                          pathname.startsWith(item.href) && "text-primary"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                      {item.items && item.items.length > 0 && (
                        <div className="pl-4 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className="block text-sm text-gray-400 hover:text-white transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Admin Portal Link for Mobile */}
                  {isAdmin() && (
                    <div className="pt-4 border-t border-gray-800">
                      <Link
                        href="/admin"
                        className="flex items-center text-lg font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Portal
                      </Link>
                    </div>
                  )}
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
      />
    </>
  );
}
