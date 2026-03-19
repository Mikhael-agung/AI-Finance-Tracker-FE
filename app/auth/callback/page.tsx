"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { syncApi } from "@/lib/api/sync";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/overview";

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient();
        // 🔍 DEBUG: Lihat session lengkap
        const { data } = await supabase.auth.getSession();

        // 🚨 TAMPILIN DI CONSOLE BROWSER
        // console.log('========== CALLBACK DEBUG ==========');
        // console.log('SESSION:', data.session);
        // console.log('PROVIDER_TOKEN:', data.session?.provider_token);
        // console.log('PROVIDER_REFRESH_TOKEN:', data.session?.provider_refresh_token);
        // console.log('USER:', data.session?.user);
        // console.log('=====================================')
        // Get the session from URL hash
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // CEK APAKAH INI GOOGLE OAUTH?
          const isGoogleOAuth =
            session.provider_token &&
            session.user?.app_metadata?.provider === "google";

          if (isGoogleOAuth && session.provider_token) {
            try {
              await syncApi.storeGoogleToken({
                google_token: session.provider_token,
                google_refresh_token: session.provider_refresh_token || "",
                expires_in: 3600, // 1 jam
              });
              toast.success("Gmail connected successfully!");
              router.push(redirectTo);
            } catch (err: any) {
              console.error("Failed to store Gmail token:", err);
              toast.error("Gmail connected but token storage failed");
              router.push(redirectTo);
            }
          } else {
            // Regular login
            toast.success("Login successful!");
            router.push(redirectTo);
          }
        } else {
          toast.error("Authentication failed");
          router.push("/login");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error(error.message || "Authentication failed");
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Signing you in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please wait while we complete authentication.
        </p>
      </div>
    </div>
  );
}
