"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { syncApi } from "@/lib/api/sync";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          const isGoogleOAuth =
            session.provider_token &&
            session.user?.app_metadata?.provider === "google";

          if (isGoogleOAuth && session.provider_token) {
            try {
              await syncApi.storeGoogleToken({
                google_token: session.provider_token,
                google_refresh_token: session.provider_refresh_token || "",
                expires_in: session.expires_in,
              });

              toast.success("Gmail connected successfully!");

              // Redirect ke sync settings kalo dari connect Gmail
              if (redirectTo.includes("sync")) {
                router.push(redirectTo);
              } else {
                router.push("/sync/settings?connected=true");
              }
            } catch (err: any) {
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}