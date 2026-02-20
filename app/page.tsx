'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0C4A6E] font-display selection:bg-primary/30">
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10"
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-2xl block">account_balance_wallet</span>
            </div>
            <h2 className="text-[#0d171c] dark:text-white text-xl font-bold tracking-tight">FinanceFlow</h2>
          </motion.div>

          <div className="hidden md:flex items-center gap-10">
            {['Fitur', 'Cara Kerja'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-sm font-semibold hover:text-primary transition-colors"
                href={`#${item.toLowerCase().replace(' ', '-')}`}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" className="hidden sm:block px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg">
                  Masuk
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
                  Akses Sekarang
                </Button>
              </motion.div>
            </Link>
          </div>
        </nav>
      </motion.header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8 z-10 text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center self-center lg:self-start gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Baru: Sinkronisasi Gmail Otomatis
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black leading-[1.1] text-[#0d171c] dark:text-white"
              >
                Kelola Keuangan Otomatis dengan <span className="text-primary">AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-[#49829c] dark:text-slate-400 max-w-xl mx-auto lg:mx-0"
              >
                Hubungkan Gmail kamu, dan biarkan Gemini AI mencatat semua transaksi bank secara otomatis. Gak perlu input manual lagi.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-primary/25 transition-all">
                      Akses Sekarang
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-purple-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3]">
                <div className="p-6 h-full flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800"></div>
                      <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 h-40 bg-primary/5 rounded-xl flex flex-col p-4 justify-between border border-primary/10">
                      <div className="h-3 w-20 bg-primary/20 rounded-full"></div>
                      <div className="flex items-end gap-2">
                        {[40, 80, 60, 70].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height }}
                            transition={{ delay: 0.8 + (i * 0.1), duration: 0.5 }}
                            className="w-full bg-primary rounded-t-lg"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-4 border-primary border-r-transparent"
                      />
                      <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + (item * 0.1) }}
                        className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center px-4 justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-6 w-6 rounded-full ${item === 1 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-sm">
                              {item === 1 ? 'arrow_downward' : 'arrow_upward'}
                            </span>
                          </div>
                          <div className={`h-3 ${item === 1 ? 'w-24' : 'w-32'} bg-slate-200 dark:bg-slate-700 rounded-full`}></div>
                        </div>
                        <div className={`h-3 ${item === 1 ? 'w-16' : 'w-20'} ${item === 1 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full`}></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 border-y border-primary/5 bg-white dark:bg-slate-900/50"
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
              Bank & Institusi Terintegrasi
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {[
                { name: 'BCA', color: 'bg-blue-600', text: 'BCA' },
                { name: 'Mandiri', color: 'bg-blue-800', text: 'MDR' },
                { name: 'BNI', color: 'bg-orange-600', text: 'BNI' },
                { name: 'BRI', color: 'bg-blue-700', text: 'BRI' },
                { name: 'GoPay', color: 'bg-cyan-500', icon: 'account_balance_wallet' }
              ].map((bank, i) => (
                <motion.div
                  key={bank.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
                    {bank.icon ? (
                      <span className="material-symbols-outlined text-sm">{bank.icon}</span>
                    ) : (
                      bank.text
                    )}
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{bank.name}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.4 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="w-full mt-10 pt-10 border-t border-primary/5 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-xs font-mono uppercase tracking-widest"
            >
              <div className="flex items-center gap-2">
                <span>Built with</span> 
                <motion.span 
                  whileHover={{ scale: 1.05, color: '#0da2e7' }}
                  className="font-bold text-slate-900 dark:text-white"
                >
                  Next.js
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full"></span> 
                <motion.span 
                  whileHover={{ scale: 1.05, color: '#0da2e7' }}
                  className="font-bold text-slate-900 dark:text-white"
                >
                  Supabase
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full"></span> 
                <motion.span 
                  whileHover={{ scale: 1.05, color: '#0da2e7' }}
                  className="font-bold text-slate-900 dark:text-white"
                >
                  Gemini 1.5 Pro
                </motion.span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-24 md:py-32 bg-background-light dark:bg-background-dark" id="fitur">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-20"
            >
              <h2 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">Fitur Unggulan</h2>
              <h3 className="text-3xl md:text-5xl font-black text-[#0d171c] dark:text-white leading-tight">
                Automasi Cerdas untuk Dompet Indonesia
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: 'mail', title: 'Auto-sync Gmail', desc: 'Terhubung langsung ke inbox Gmail kamu untuk membaca mutasi rekening secara otomatis.' },
                { icon: 'auto_awesome', title: 'Kategorisasi AI', desc: 'Gemini 1.5 Flash mengelompokkan pengeluaran kamu (Makan, Jajan, Tagihan) dengan akurasi 99%.' },
                { icon: 'account_balance', title: 'Multi-wallet Support', desc: 'Pantau BCA, Mandiri, BRI, BNI, hingga GoPay dan OVO dalam satu dashboard terpusat.' },
                { icon: 'verified_user', title: 'Keamanan Tingkat Bank', desc: 'Data Anda dienkripsi SSL 256-bit tingkat tinggi. Privasi dan keamanan adalah prioritas nomor satu kami.' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all group hover:shadow-xl hover:shadow-primary/5"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, backgroundColor: '#0da2e7' }}
                    className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                  </motion.div>
                  <h4 className="text-xl font-bold text-[#0d171c] dark:text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white dark:bg-slate-900/30" id="cara-kerja">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">Cara Penggunaan</h2>
              <h3 className="text-3xl md:text-4xl font-black text-[#0d171c] dark:text-white">Sederhana untuk Kita Semua</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: 'key', title: '1. Connect Google', desc: 'Otorisasi akses baca-saja ke Gmail kamu melalui protokol Google OAuth yang aman.' },
                { icon: 'psychology', title: '2. AI Parsing', desc: 'Sistem kami mengekstrak detail transaksi dari email notifikasi bank secara real-time.' },
                { icon: 'insights', title: '3. Insight & Relax', desc: 'Dapatkan laporan keuangan lengkap tanpa pernah mengetik satu angka pun di aplikasi.' }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6"
                  >
                    <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                  </motion.div>
                  <h5 className="font-bold text-xl mb-3">{step.title}</h5>
                  <p className="text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/20 rounded-full blur-3xl"
              />

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10"
              >
                Automasi Keuanganmu Sekarang
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10"
              >
                Hubungkan Gmail kamu, dan biarkan Gemini AI mencatat semua transaksi bank secara otomatis. Gak perlu input manual lagi.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 justify-center relative z-10"
              >
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary/25 transition-all">
                      Masuk Sekarang
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-slate-950 pt-20 pb-10 border-t border-slate-100 dark:border-slate-900"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-12">
            {/* Top Section: Logo & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-2xl block">account_balance_wallet</span>
                </div>
                <h2 className="text-[#0d171c] dark:text-white text-xl font-bold tracking-tight">FinanceFlow</h2>
              </div>
              <p className="text-slate-500 text-base max-w-sm">Manajemen keuangan cerdas untuk komunitas terbatas.</p>
            </motion.div>

            {/* Middle Section: Socials & Simple Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex gap-6">
                {[
                  { name: 'twitter', path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
                  { name: 'instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { name: 'linkedin', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' }
                ].map((social, i) => (
                  <motion.a
                    key={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="text-slate-400 hover:text-primary transition-colors"
                    href="#"
                    aria-label={social.name}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path}></path>
                    </svg>
                  </motion.a>
                ))}
              </div>
              <div className="flex gap-8">
                {['Ketentuan', 'Privasi'].map((link, i) => (
                  <motion.a
                    key={link}
                    whileHover={{ x: 3 }}
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                    href="#"
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Bottom Section: Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col items-center gap-4"
            >
              <p className="text-sm text-slate-400 text-center">© 2024 FinanceFlow. Dibuat dengan penuh perhatian untuk komunitas terpilih.</p>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 opacity-60"
              >
                <span className="material-symbols-outlined text-xs">verified</span>
                Community Member Only
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}