// wallets/page.tsx
'use client'

import { Wallet } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export default function WalletsPage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Manajemen Dompet"
      description="Kelola semua rekening bank dan dompet digital kamu dalam satu tempat."
      features={[
        'Tambah & edit dompet bank (BCA, BNI, dll)',
        'Lihat saldo real-time per dompet',
        'Riwayat mutasi per dompet',
        'Set dompet utama untuk transaksi',
      ]}
    />
  )
}