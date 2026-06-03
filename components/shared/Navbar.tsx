"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, GraduationCap, LogOut, User, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {user ? (
        <>
          <Link href="/dashboard">
            <Button
              onClick={() => mobile && setIsOpen(false)}
              variant="ghost"
              className={`${mobile ? "w-full justify-start" : ""} text-base`}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/grammar">
            <Button
              onClick={() => mobile && setIsOpen(false)}
              variant="ghost"
              className={`${mobile ? "w-full justify-start" : ""} text-base`}
            >
              Grammar
            </Button>
          </Link>
          <Link href="/vocabulary">
            <Button
              onClick={() => mobile && setIsOpen(false)}
              variant="ghost"
              className={`${mobile ? "w-full justify-start" : ""} text-base`}
            >
              Vocabulary
            </Button>
          </Link>
          <Link href="/reading">
            <Button
              onClick={() => mobile && setIsOpen(false)}
              variant="ghost"
              className={`${mobile ? "w-full justify-start" : ""} text-base`}
            >
              Reading
            </Button>
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              <BookOpen className="absolute -bottom-1 -right-1 h-4 w-4 text-chart-2 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
              MET Prep
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLinks />
          </div>

          {user ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] glass">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <span className="font-bold">MET Prep</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4">
                    <NavLinks mobile />
                    <div className="h-px bg-border my-6" />
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-4">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:block">
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full hover:scale-105 transition-transform">
                    <Avatar className="h-11 w-11 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="p-3 cursor-pointer"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive p-3 cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-3">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="default" className="text-base">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="default"
                  className="bg-gradient-to-r from-primary to-chart-2 hover:scale-105 px-4 md:px-6 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu for non-authenticated users */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] glass">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <span className="font-bold">MET Prep</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full text-base">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="block">
                      <Button className="w-full bg-gradient-to-r from-primary to-chart-2 text-base">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
