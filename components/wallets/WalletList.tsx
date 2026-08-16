'use client';

import { Wallet as WalletIcon } from 'lucide-react';
import type { Wallet } from '@/types/wallet.types';
import WalletCard from './WalletCard';
import EmptyState from '@/components/shared/EmptyState';

interface WalletListProps {
    wallets: Wallet[];
    loading?: boolean;
    onCardClick?: (wallet: Wallet) => void;
    onCardMenuClick?: (wallet: Wallet) => void;
    balanceVisible?: boolean;
}

function WalletCardSkeleton() {
    return (
        <div className="flex min-h-[160px] animate-pulse flex-col justify-between rounded-xl border border-border bg-card p-5">
            <div className="mb-6 flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-muted" />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-6 w-28 rounded bg-muted" />
            </div>
        </div>
    );
}

export default function WalletList({ wallets, loading, onCardClick, onCardMenuClick, balanceVisible = true }: WalletListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <WalletCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (wallets.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16">
                <EmptyState
                    icon={WalletIcon}
                    title="Belum ada wallet"
                    description="Tambah wallet pertama kamu untuk mulai melacak keuangan."
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
                <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onClick={onCardClick}
                    onMenuClick={onCardMenuClick}
                    balanceVisible={balanceVisible}
                />
            ))}
        </div>
    );
}