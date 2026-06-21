'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const PERIODS = [
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'last_month', label: 'Bulan Lalu' },
    { value: 'this_year', label: 'Tahun Ini' },
    { value: 'all', label: 'Semua Waktu' },
];

const FORMATS = ['CSV', 'PDF'] as const;

export function TransactionExportMenu() {
    const handleExport = (period: string, format: string) => {
        toast.info('Fitur export segera hadir', {
            description: `Export ${format} untuk periode "${period}" belum tersedia.`,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Pilih periode &amp; format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PERIODS.map((period) => (
                    <div key={period.value} className="px-2 py-1">
                        <p className="text-xs text-muted-foreground mb-1">{period.label}</p>
                        <div className="flex gap-2 mb-2">
                            {FORMATS.map((format) => (
                                <button
                                    key={format}
                                    onClick={() => handleExport(period.label, format)}
                                    className="flex-1 text-xs font-semibold py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}