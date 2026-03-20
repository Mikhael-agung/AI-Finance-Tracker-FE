// budgets/page.tsx
'use client'

import { PieChart } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export default function BudgetsPage() {
  return (
    <ComingSoon
      icon={PieChart}
      title="Budget & Anggaran"
      description="Buat dan pantau anggaran bulanan per kategori agar pengeluaran tetap terkontrol."
      features={[
        'Buat budget per kategori pengeluaran',
        'Notifikasi saat budget hampir habis',
        'Progress bar visual per kategori',
        'Laporan budget vs aktual tiap bulan',
      ]}
    />
  )
}