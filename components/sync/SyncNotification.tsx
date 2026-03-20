'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type SyncState = 'idle' | 'success' | 'limit_reached';

interface SyncNotificationProps {
    state: SyncState;
    newTransactions?: number;
    syncsUsed?: number;       // berapa kali sudah sync hari ini
    maxSyncs?: number;        // batas maksimal (default 5)
    onClose?: () => void;
}

// ─── Helper: hitung waktu reset ke tengah malam ──────────────────────────────
function getTimeUntilMidnight(): string {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes} menit`;
    return `${hours} jam ${minutes} menit`;
}

// ─── Toast: Sync Berhasil ─────────────────────────────────────────────────────
function SyncSuccessToast({
    newTransactions = 0,
    syncsUsed = 0,
    maxSyncs = 5,
    onClose,
}: {
    newTransactions?: number;
    syncsUsed?: number;
    maxSyncs?: number;
    onClose?: () => void;
}) {
    const [visible, setVisible] = useState(true);
    const remaining = maxSyncs - syncsUsed;

    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 500);
        }, 3000);
        return () => clearTimeout(hideTimer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 min-w-[320px] max-w-sm">
                <div className="flex items-center gap-3 p-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Text */}
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                            Sinkronisasi Berhasil!
                        </p>
                        <p className="text-xs text-gray-500">
                            {newTransactions > 0
                                ? `${newTransactions} transaksi baru ditemukan`
                                : 'Tidak ada transaksi baru'}
                        </p>
                        <p className="text-[10px] text-[#0da2e7] mt-0.5">
                            Sisa {remaining}/{maxSyncs} jatah sync hari ini
                        </p>
                    </div>

                    {/* Close */}
                    <button
                        aria-label='tutup notifikasi'
                        onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 500); }}
                        className="text-gray-300 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Progress bar countdown 3 detik */}
                <div className="h-[3px] bg-[#0da2e7]" style={{ animation: 'countdown 3s linear forwards' }} />
            </div>

            <style jsx>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

// ─── Modal: Batas Harian Tercapai ─────────────────────────────────────────────
function SyncLimitModal({
    maxSyncs = 5,
    onClose,
}: {
    maxSyncs?: number;
    onClose?: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40">
            <article className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 flex flex-col items-center text-center">

                    {/* Icon */}
                    <div className="mb-6 flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full">
                        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Batas Harian Tercapai</h2>
                    <p className="text-slate-600 mb-6">
                        Kamu sudah melakukan{' '}
                        <span className="font-semibold text-slate-900">{maxSyncs}x sinkronisasi</span> hari ini.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-500">Kapasitas harian</span>
                            <span className="text-sm font-bold text-rose-500">100%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#F43F5E] h-2.5 rounded-full w-full" />
                        </div>
                    </div>

                    {/* Reset info */}
                    <div className="w-full space-y-4 mb-8">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="text-sm text-slate-600">
                                Reset dalam{' '}
                                <span className="font-medium">{getTimeUntilMidnight()}</span>{' '}
                                (tengah malam)
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            Sinkronisasi otomatis tetap berjalan setiap tengah malam
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        Oke, Mengerti
                    </button>
                </div>
            </article>
        </div>
    );
}


export function SyncNotification({
    state,
    newTransactions = 0,
    syncsUsed = 0,
    maxSyncs = 5,
    onClose,
}: SyncNotificationProps) {
    if (state === 'success') {
        return (
            <SyncSuccessToast
                newTransactions={newTransactions}
                syncsUsed={syncsUsed}
                maxSyncs={maxSyncs}
                onClose={onClose}
            />
        );
    }

    if (state === 'limit_reached') {
        return <SyncLimitModal maxSyncs={maxSyncs} onClose={onClose} />;
    }

    return null;
}

export type { SyncState };