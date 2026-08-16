import type {LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'Belum ada data',
    description = 'Data akan muncul di sini setelah tersedia.',
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
