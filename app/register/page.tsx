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
import { GraduationCap, BookOpen, Loader2, Eye, EyeOff, CheckCircle2, Sparkles, Star } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const passwordRequirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "One special character" },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        if (error.message.includes("already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(error.message || "Failed to create account. Please try again.");
        }
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
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-chart-2/5 via-primary/10 to-chart-3/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-[100px] floating" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-3/20 rounded-full blur-[100px] floating" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-md text-center relative z-10">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-chart-2/20 rounded-full blur-3xl" />
            <BookOpen className="relative h-32 w-32 text-chart-2 floating" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
            Join thousands of students preparing for the Michigan English Test
            with comprehensive exercises and personalized learning.
          </p>

          <div className="space-y-3">
            {[
              { icon: <Sparkles className="h-5 w-5" />, text: "Interactive grammar exercises" },
              { icon: <BookOpen className="h-5 w-5" />, text: "Vocabulary building tools" },
              { icon: <Star className="h-5 w-5" />, text: "Reading comprehension practice" },
              { icon: <GraduationCap className="h-5 w-5" />, text: "Progress tracking & analytics" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 glass px-5 py-3 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/10 text-chart-2">
                  {feature.icon}
                </div>
                <span className="text-left font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">Create your account</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Start preparing for the Michigan English Test today
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
                  <Label htmlFor="fullName" className="text-base font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base bg-background/50"
                  />
                </div>

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
                    className="h-12 text-base bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                  {password && (
                    <div className="space-y-1.5 pt-2 grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs md:text-sm">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 shrink-0 ${
                              req.met ? "text-chart-2" : "text-muted-foreground/30"
                            }`}
                          />
                          <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-chart-2 hover:scale-[1.02] h-12 text-base font-semibold transition-all duration-300"
                  disabled={loading || (password.length > 0 && !isPasswordValid)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>

          <div className="mt-6 md:mt-8 text-center text-sm text-muted-foreground animate-in" style={{ animationDelay: '0.2s' }}>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
