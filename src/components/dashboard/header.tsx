"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileNav } from "@/components/navigation/mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { ButtonClickEvent } from "@/lib/types";

export default function Header() {
  const pathname = usePathname();

  const handleLogout = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Implement logout logic here
    // For example:
    // await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Kogase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/dashboard/projects")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Projects
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/dashboard/analytics")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/dashboard/settings"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/dashboard/settings")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
