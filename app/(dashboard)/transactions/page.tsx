// transactions/page.tsx
'use client'

import { CreditCard } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export default function TransactionsPage() {
  return (
    <ComingSoon
      icon={CreditCard}
      title="Manajemen Transaksi"
      description="Lihat, filter, dan kelola semua transaksi kamu dari berbagai dompet dalam satu tampilan yang rapi."
      features={[
        'Filter transaksi by tanggal, kategori, dan dompet',
        'Edit & hapus transaksi manual',
        'Export transaksi ke CSV / PDF',
        'Pencarian transaksi real-time',
        'Bulk kategorisasi dengan AI',
      ]}
    />
  )
}