// reports/page.tsx
'use client'


import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Laporan Keuangan"
      description="Analisis mendalam keuangan kamu dengan grafik dan laporan bulanan otomatis."
      features={[
        'Laporan pemasukan & pengeluaran bulanan',
        'Grafik tren pengeluaran per kategori',
        'Perbandingan bulan ke bulan',
        'Export laporan ke PDF',
        'Insight AI tentang kebiasaan finansial',
      ]}
    />
  )
}