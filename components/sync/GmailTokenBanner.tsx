'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api/client';

export function GmailTokenBanner() {
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Cek di sessionStorage apakah banner sudah di-dismiss
        const isDismissed = sessionStorage.getItem('gmail_banner_dismissed');
        if (isDismissed) return;

        const checkToken = async () => {
            try {
                const { data } = await api.get<any>('/sync/status');
                if (data?.is_expired || !data?.connected) {
                    setShow(true);
                }
            } catch {
                // silent fail
            }
        };

        checkToken();
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        setShow(false);
        sessionStorage.setItem('gmail_banner_dismissed', 'true');
    };

    const handleReconnect = () => {
        router.push('/login?reconnect=true');
    };

    if (!show || dismissed) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800">Token Gmail Expired</p>
                <p className="text-xs text-amber-700 mt-0.5">
                    Sinkronisasi otomatis tidak berjalan. Reconnect Gmail untuk melanjutkan.
                </p>
            </div>
            <button
                onClick={handleReconnect}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
                <ExternalLink className="h-3 w-3" />
                Reconnect
            </button>
            <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
                aria-label="Tutup banner"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}