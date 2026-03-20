"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import { syncApi } from "@/lib/api/sync";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";

interface GmailConnectProps {
  onConnected?: () => void;
  isConnected?: boolean;
  email?: string;
}

export default function GmailConnect({
  onConnected,
  isConnected = false,
  email,
}: GmailConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const supabase = createBrowserClient();

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/sync/settings`,
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
      toast.error("Failed to connect Gmail. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const result = await syncApi.testConnection();

      if (result.success) {
        toast.success(`Connected as ${result.data.email}`);
      } else {
        toast.error(result.error || "Connection test failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await syncApi.disconnectGmail();
      toast.success("Gmail disconnected");
      onConnected?.();
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Gmail Connected</span>
        </div>

        {email && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isLoading} className="w-full">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      Connect Gmail Account
    </Button>
  );
}
