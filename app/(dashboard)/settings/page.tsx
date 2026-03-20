// settings/page.tsx
'use client'

import { Settings } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Pengaturan"
      description="Kustomisasi aplikasi sesuai preferensi kamu — dari profil hingga notifikasi."
      features={[
        'Edit profil & foto akun',
        'Atur notifikasi & reminder',
        'Kelola koneksi Gmail & bank',
        'Preferensi mata uang & bahasa',
        'Keamanan & privasi akun',
      ]}
    />
  )
}