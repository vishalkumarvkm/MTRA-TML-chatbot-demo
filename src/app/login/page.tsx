"use client";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { mockAuthUsers } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/";
  const { loginAs, isAuthenticated } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to target if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));

    // Validate email and password combination for core roles
    const expectedPasswords: Record<string, string> = {
      "employee@montefiore.org": "montefiore01",
      "manager@montefiore.org": "montefiore02",
      "admin@montefiore.org": "montefiore04",
    };

    const userEmailKey = email.toLowerCase();
    if (
      !expectedPasswords[userEmailKey] ||
      password !== expectedPasswords[userEmailKey]
    ) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Find user by email or assign default
    const matchedUser = mockAuthUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (matchedUser) {
      loginAs(matchedUser);
      router.push(redirectTarget);
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your email and password to access the HealthyME Navigator."
    >
      <form onSubmit={handleLogin} className="space-y-4" data-ocid="login.form">
        {error && (
          <div className="p-3 rounded-lg bg-brand-black text-brand-white text-xs font-semibold border border-brand-black animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@montefiore.org"
              disabled={loading}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:border-primary/50 outline-none transition-all focus:ring-1 focus:ring-primary/20"
              data-ocid="login.email_input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-sm focus:border-primary/50 outline-none transition-all focus:ring-1 focus:ring-primary/20"
              data-ocid="login.password_input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-xl text-sm font-bold shadow-md transition-all"
          data-ocid="login.submit_button"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading login portal...
            </span>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
