"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Car, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/admin/login', { email, password });
      if (response.data.success) {
        document.cookie = `admin_token=${response.data.data.accessToken}; path=/; max-age=86400`;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your access level.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch on animations

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background with Grid and Glows */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background blur-3xl opacity-50" />
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-background to-background blur-3xl opacity-50" />
        
        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="z-10 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="flex flex-col items-center mb-8 space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-24 h-24 rounded-2xl border border-white/10 bg-black/50 shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-xl">
              <Image 
                src="/logo.jpeg" 
                alt="Logo" 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                }}
              />
              <div className="fallback hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                <Car className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
              Command Center
              <ShieldCheck className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Secure access for GoLongDrive administrators
            </p>
          </div>
        </div>

        <Card className="border-white/10 shadow-2xl bg-black/60 backdrop-blur-2xl overflow-hidden relative">
          {/* Subtle top inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input 
                      type="email" 
                      placeholder="admin@golongdrive.com" 
                      className="pl-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all shadow-inner rounded-xl text-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                      Password
                    </label>
                    <a href="#" className="text-xs text-primary/80 hover:text-primary hover:underline transition-colors">
                      Recover access
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-11 pr-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all shadow-inner rounded-xl text-base tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-muted-foreground hover:text-primary transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-black rounded" 
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    Keep me signed in
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-base shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] group overflow-hidden relative"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/30" />
                </div>
                
                <span className="flex items-center justify-center gap-2 relative z-10">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Authorize Session
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8 font-mono opacity-60 flex items-center justify-center gap-2">
          SYSTEM V2.0.4 <span className="w-1 h-1 rounded-full bg-primary animate-pulse" /> SECURE ENCLAVE
        </p>
      </div>
    </div>
  );
}
