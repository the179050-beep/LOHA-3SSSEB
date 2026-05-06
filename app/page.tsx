"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firestore";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const router = useRouter();

  const emailInvalid = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordInvalid = touched.password && formData.password.length < 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });

    if (emailInvalid || passwordInvalid) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/notifications");
    } catch (err) {
      setError("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-cyan-500/20 to-emerald-500/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl"
        />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px]"
          aria-hidden
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-emerald-400/40"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo / Brand section */}
          <motion.div 
            className="mb-8 flex flex-col items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-50" />
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 shadow-2xl backdrop-blur-xl">
                <Shield className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-400">منصة آمنة ومحمية</span>
            </motion.div>
          </motion.div>

          <Card className="relative overflow-hidden border-0 bg-slate-900/70 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 p-[1px]">
              <div className="h-full w-full rounded-xl bg-slate-900/90" />
            </div>
            
            {/* Top accent gradient */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="relative">
              <CardHeader className="pt-10 pb-2 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                    تسجيل الدخول
                  </CardTitle>
                  <p className="mt-3 text-sm text-slate-400">
                    أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك
                  </p>
                </motion.div>
              </CardHeader>

              <CardContent className="px-6 pt-4 pb-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                      البريد الإلكتروني
                    </Label>
                    <div className="group relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors group-focus-within:text-emerald-400">
                        <Mail className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-emerald-400" />
                      </span>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        placeholder="example@email.com"
                        className={`h-12 pr-4 pl-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-emerald-500/50 focus:bg-slate-800/80 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-0 ${
                          emailInvalid ? "border-red-500/50 focus:border-red-500/50 focus-visible:ring-red-500/30" : ""
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        disabled={isLoading}
                        aria-invalid={emailInvalid || undefined}
                        aria-describedby="email-help"
                      />
                    </div>
                    {emailInvalid && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="email-help" 
                        className="text-xs text-red-400"
                      >
                        صيغة البريد الإلكتروني غير صحيحة
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Password Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                      كلمة المرور
                    </Label>
                    <div className="group relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Lock className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-emerald-400" />
                      </span>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className={`h-12 pr-12 pl-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:border-emerald-500/50 focus:bg-slate-800/80 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-0 ${
                          passwordInvalid ? "border-red-500/50 focus:border-red-500/50 focus-visible:ring-red-500/30" : ""
                        }`}
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        disabled={isLoading}
                        aria-invalid={passwordInvalid || undefined}
                        aria-describedby="password-help"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordInvalid && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="password-help" 
                        className="text-xs text-red-400"
                      >
                        يجب أن تكون كلمة المرور 6 أحرف على الأقل
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400 backdrop-blur"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>جاري تسجيل الدخول...</span>
                          </>
                        ) : (
                          <>
                            <span>تسجيل الدخول</span>
                            <LogIn className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col items-center gap-3 pb-8 pt-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-700" />
                  <span>محمي بتشفير متقدم</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-700" />
                </div>
                <p className="text-xs text-slate-600">
                  © {new Date().getFullYear()} جميع الحقوق محفوظة
                </p>
              </CardFooter>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
