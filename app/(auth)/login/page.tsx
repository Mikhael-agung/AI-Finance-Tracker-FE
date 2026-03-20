"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const supabase = createBrowserClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            scope:
              "email profile https://www.googleapis.com/auth/gmail.readonly",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error("Failed to login with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login successful!");
      router.push(redirectTo);
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Left Side: Visuals & Testimonial (New Design) */}
      {/* Left Side: Visuals & Testimonial - Full Height, No Scroll */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col p-12 text-white h-screen"
        style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #0284c7 100%)",
        }}
      >
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-300 blur-[100px]"></div>
        </div>

        {/* Content Container - Full Height Flex Column */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Branding Top */}
          <div className="flex items-center gap-3">
            <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-[#0EA5E9] font-black text-2xl tracking-tighter">
                FF
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              FinanceFlow
            </span>
          </div>

          {/* Main Content - Takes remaining space and centers vertically */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {/* Main Dashboard Card - LARGER */}
            <div
              className="p-8 rounded-2xl w-full max-w-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 mx-auto"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="h-5 w-32 bg-white/20 rounded-full"></div>
                <div className="h-10 w-10 bg-white/10 rounded-full"></div>
              </div>

              <div className="space-y-6">
                {/* Chart Bars - BIGGER */}
                <div className="h-48 w-full bg-gradient-to-t from-white/5 to-white/20 rounded-xl flex items-end p-6 gap-3">
                  <div className="flex-1 bg-white/40 h-[30%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/60 h-[70%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/30 h-[45%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/80 h-[90%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/50 h-[55%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/40 h-[40%] rounded-t-lg"></div>
                  <div className="flex-1 bg-white/70 h-[75%] rounded-t-lg"></div>
                </div>

                {/* Transaction Item - BIGGER */}
                <div className="flex items-center gap-5 p-3 bg-white/5 rounded-xl">
                  <div className="h-14 w-14 bg-white/20 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-white/30 rounded-full"></div>
                    <div className="h-3 w-1/2 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-8 w-20 bg-emerald-400/30 rounded-lg"></div>
                </div>

                {/* Another Transaction Item */}
                <div className="flex items-center gap-5 p-3 bg-white/5 rounded-xl">
                  <div className="h-14 w-14 bg-white/20 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 bg-white/30 rounded-full"></div>
                    <div className="h-3 w-1/3 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-8 w-16 bg-amber-400/30 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Floating Savings Card - LARGER and repositioned */}
            <div
              className="p-5 rounded-xl w-72 self-end -mt-16 mr-12 shadow-2xl"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="size-12 bg-emerald-400/40 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-100 text-2xl">
                    trending_up
                  </span>
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase font-bold tracking-wider">
                    TABUNGAN
                  </div>
                  <div className="text-2xl font-black">+Rp 2.400.000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="mt-8">
            <p className="text-4xl font-black leading-tight mb-4">
              Otomatisasi Laporan Keuangan Anda.
            </p>
            <p className="text-xl font-medium text-white/90 leading-relaxed">
              Jangan habiskan waktu mencatat manual. Biarkan sistem kami bekerja
              untuk Anda.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 size-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-96 bg-black/10 rounded-full blur-3xl"></div>
          <div
            className="absolute top-0 right-0 w-40 h-full z-30 pointer-events-none 
            bg-gradient-to-r from-transparent via-transparent to-background-light dark:to-background-dark opacity-100"
          ></div>
        </div>
      </div>

      {/* Right Side: Login Section - MOBILE FIXED */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 bg-gradient-to-br from-background-light via-white to-background-light dark:from-background-dark dark:via-gray-900 dark:to-background-dark min-h-screen overflow-hidden">
        <div className="w-full max-w-[420px] flex flex-col">
          {/* Mobile Logo - DIPERPANJANG JARAKNYA */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="size-16 bg-[#0da2e7] rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-black tracking-tighter italic select-none">
                FF
              </span>
            </div>
            <span className="text-3xl font-black tracking-tight text-[#0d171c] dark:text-white select-none">
              FinanceFlow
            </span>
          </div>

          {/* Welcome Text */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[#0d171c] dark:text-white mb-3 select-none">
              Selamat Datang Kembali
            </h2>
            <p className="text-base text-[#49829c] dark:text-[#73a0b5] select-none">
              Kelola keuangan lebih cerdas. Silakan masuk ke akun Anda.
            </p>
          </div>

          {/* Auth Buttons - TAMBAHKAN translate="no" */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-14 bg-white dark:bg-[#1a2c36] border border-[#e7f0f4] dark:border-[#2a3f4a] rounded-xl hover:bg-[#f8fbfc] dark:hover:bg-[#20343f] transition-all duration-200 shadow-md text-[#0d171c] dark:text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              translate="no"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
              )}
              <span className="select-none">Masuk dengan Google</span>
            </button>

            <button
              onClick={handleEmailLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-14 bg-white dark:bg-[#1a2c36] border border-[#e7f0f4] dark:border-[#2a3f4a] rounded-xl hover:bg-[#f8fbfc] dark:hover:bg-[#20343f] transition-all duration-200 shadow-md text-[#0d171c] dark:text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              translate="no"
            >
              <span className="material-symbols-outlined text-primary text-xl select-none">
                mail
              </span>
              <span className="select-none">Masuk dengan Email</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4 text-[#49829c] dark:text-[#73a0b5] text-sm">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#49829c] to-transparent dark:via-[#73a0b5] opacity-30"></div>
            <span className="font-medium select-none">atau gunakan</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#49829c] to-transparent dark:via-[#73a0b5] opacity-30"></div>
          </div>

          {/* Register Button */}
          <div className="mb-6">
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full flex items-center justify-center h-14 bg-gradient-to-r from-primary to-[#0b8ac7] text-white rounded-xl hover:from-primary/90 hover:to-[#0b8ac7]/90 transition-all duration-300 font-bold text-base shadow-md shadow-primary/30 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              translate="no"
            >
              <span className="select-none">Buat Akun Baru</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mb-8 text-center text-sm text-[#49829c] dark:text-[#73a0b5] leading-relaxed select-none">
            Dengan masuk, Anda menyetujui{" "}
            <a
              className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
              href="#"
              translate="no"
            >
              Ketentuan Layanan
            </a>{" "}
            dan{" "}
            <a
              className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
              href="#"
              translate="no"
            >
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>

          {/* Trust Badges - TAMBAHKAN translate="no" */}
          <div className="pt-6 border-t border-[#e7f0f4] dark:border-[#2a3f4a]">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#49829c] dark:text-[#73a0b5] opacity-60 select-none">
                KEAMANAN TERJAMIN
              </p>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2" translate="no">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-base select-none">
                      lock
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#49829c] dark:text-[#73a0b5] select-none">
                    256-bit SSL
                  </span>
                </div>
                <div className="flex items-center gap-2" translate="no">
                  <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg
                      className="size-4 text-emerald-500 select-none"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.362 9.354H12V.338L2.638 14.646H12v9.016l9.362-14.308z"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-[#49829c] dark:text-[#73a0b5] select-none">
                    Supabase Auth
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#49829c] dark:text-[#73a0b5] mt-1 opacity-70 select-none">
                Data Anda aman dan terenkripsi menggunakan standar perbankan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
