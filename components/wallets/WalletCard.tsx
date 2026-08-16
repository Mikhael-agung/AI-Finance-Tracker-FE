'use client';

import { Building2, Wallet as WalletIcon, TrendingUp, MoreVertical, Star } from 'lucide-react';
import type { Wallet } from '@/types/wallet.types';
import { formatCurrency } from '@/lib/utils/formatters';

interface WalletCardProps {
    wallet: Wallet;
    onClick?: (wallet: Wallet) => void;
    onMenuClick?: (wallet: Wallet) => void;
}

const BANK_STYLE: Record<string, { icon: React.ElementType; className: string }> = {
    BCA: { icon: Building2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    Mandiri: { icon: Building2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    BRI: { icon: Building2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    BNI: { icon: Building2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    CIMB: { icon: Building2, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    OVO: { icon: WalletIcon, className: 'bg-primary/10 text-primary border-primary/20' },
    GoPay: { icon: WalletIcon, className: 'bg-primary/10 text-primary border-primary/20' },
    Dana: { icon: WalletIcon, className: 'bg-primary/10 text-primary border-primary/20' },
    Cash: { icon: WalletIcon, className: 'bg-primary/10 text-primary border-primary/20' },
    Other: { icon: TrendingUp, className: 'bg-[oklch(0.809_0.150_162_/_0.1)] text-[oklch(0.55_0.15_162)] border-[oklch(0.809_0.150_162_/_0.2)] dark:text-[oklch(0.809_0.150_162)]' },
};

/** Mask account_number di render layer — BE gak masking sama sekali (lihat WALLET_HANDOFF.md §1). */
function maskAccountNumber(accountNumber?: string): string | null {
    if (!accountNumber || accountNumber.length < 4) return accountNumber ?? null;
    return `•••• ${accountNumber.slice(-4)}`;
}

export default function WalletCard({ wallet, onClick, onMenuClick }: WalletCardProps) {
    const style = BANK_STYLE[wallet.bank] ?? BANK_STYLE.Other;
    const Icon = style.icon;
    const maskedAccount = maskAccountNumber(wallet.account_number);

    return (
        <div
            onClick={() => onClick?.(wallet)}
            className="group flex min-h-[160px] cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
            <div className="mb-6 flex items-start justify-between">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${style.className}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                    {wallet.is_default && (
                        <Star className="h-4 w-4 fill-primary text-primary" aria-label="Wallet utama" />
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuClick?.(wallet);
                        }}
                        className="rounded-md p-1 text-muted-foreground opacity-0 transition-colors hover:text-foreground group-hover:opacity-100"
                        aria-label="Menu wallet"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div>
                <p className="text-base font-medium text-foreground">{wallet.name}</p>
                <p className="mb-2 text-xs text-muted-foreground">
                    {wallet.bank}
                    {maskedAccount ? ` • ${maskedAccount}` : ''}
                </p>
                <p className="font-mono text-xl font-bold text-foreground">
                    {formatCurrency(wallet.current_balance, wallet.currency)}
                </p>
            </div>
        </div>
    );
}