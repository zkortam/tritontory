"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { User, LogOut, Settings, UserPlus, Shield } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { user, userRole, signOut, isAdmin } = useAuth();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return "U";
    
    if (user.displayName) {
      const names = user.displayName.split(" ");
      return names.map(name => name[0]).join("").toUpperCase().slice(0, 2);
    }
    
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  // If user is logged in, show user menu
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <span className="text-sm font-medium text-white">
              {getUserInitials()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">
                {user.displayName || user.email}
              </p>
              <p className="text-xs leading-none text-gray-400">
                {userRole?.role || 'viewer'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin() && (
            <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If user is not logged in, show single account button
  return (
    <Button asChild size="sm" className="bg-tory-600 hover:bg-tory-700">
      <Link href="/auth">
        <UserPlus className="mr-2 h-4 w-4" />
        Account
      </Link>
    </Button>
  );
} 