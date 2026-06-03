"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, BookOpen, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || "Failed to sign in. Please check your credentials.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 md:mb-10 animate-in">
            <Link href="/" className="flex items-center space-x-2 group mb-6 md:mb-8">
              <div className="relative">
                <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary transition-transform group-hover:scale-110" />
                <BookOpen className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 text-chart-2 group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                MET Prep
              </span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">Welcome back</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Sign in to continue your English learning journey
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 animate-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="animate-in" style={{ animationDelay: '0.1s' }}>
            <Card className="glass border-border/50 overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address"
                    className="h-12 text-base bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 text-base pr-10 bg-background/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-12 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-chart-2 hover:scale-[1.02] h-12 text-base font-semibold transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>

          <div className="mt-6 md:mt-8 text-center text-sm text-muted-foreground animate-in" style={{ animationDelay: '0.2s' }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold transition-colors">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 via-primary/10 to-chart-2/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] floating" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-[100px] floating" style={{ animationDelay: '1s' }} />

        <div className="max-w-md text-center relative z-10">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
            <GraduationCap className="relative h-32 w-32 text-primary floating" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Master Michigan English Test</h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Practice grammar, vocabulary, and reading comprehension with
            personalized exercises and real-time progress tracking.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {[
              { icon: <Sparkles className="h-4 w-4" />, text: "AI-Powered" },
              { icon: <BookOpen className="h-4 w-4" />, text: "500+ Questions" },
              { icon: <GraduationCap className="h-4 w-4" />, text: "Expert Content" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-4 py-2 rounded-full glass text-sm font-medium"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
