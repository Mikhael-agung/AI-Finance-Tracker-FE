'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Shield, Bell, RefreshCcw, Smartphone, Check, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation - HANYA SATU NAV ELEMENT */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-xs py-2 px-3 sm:text-sm sm:py-3 sm:px-4 rounded-lg text-white">
                Get Started
                <ArrowRight className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        {/* Hero Text */}
        <div className="max-w-4xl mx-auto text-center py-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Financial clarity,
            <motion.span 
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              powered by AI
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Smart syncing, automated budgeting, and military-grade security in one sleek interface.
            <span className="block font-medium text-gray-800 dark:text-gray-200 mt-2">
              Manage wealth better.
            </span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4"
          >
            <Link href="/login" className="w-full sm:w-auto flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-[70%] sm:w-62.5" 
              >
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 rounded-2xl">
                  <RefreshCcw className="mr-3 h-5 w-5" />
                  <span className="whitespace-nowrap">Get Started with Google</span>
                </Button>
              </motion.div>
            </Link>
            <Link href="#features" className="w-full sm:w-auto flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-[70%] sm:w-62.5">
                <Button
                  variant="outline"
                  className="w-full border-2 py-6 rounded-2xl">
                  See How It Works
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-500"
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
  Join <span className="text-blue-600 dark:text-blue-400">10k+</span> users managing wealth better{" "}
  <span className="text-blue-600 dark:text-blue-400">{"(gimmik doang ini)"}</span> 
</span>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto my-20"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </motion.div>

        {/* Features Section */}
        <div id="features" className="max-w-6xl mx-auto py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Sleek Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Modern tools for your financial journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: RefreshCcw,
                title: "Email Sync",
                description: "Automated expense tracking from digital receipts and invoices instantly.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Brain,
                title: "AI Analysis",
                description: "Deep insights into spending habits with personalized saving recommendations.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Bell,
                title: "Budget Alerts",
                description: "Real-time push notifications before you exceed your monthly limits.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Shield,
                title: "Security",
                description: "Bank-level encryption and secure auth powered by Supabase & Google.",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity`} />
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PWA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto py-20 text-center"
        >
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Ready to take control of your wealth?
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Install our PWA on your home screen for a seamless, native mobile experience with no app store required.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl text-white py-6 px-8 rounded-xl text-lg"
                      >
                        <Smartphone className="mr-3 h-6 w-6" />
                        Install Web App
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="#features">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 py-6 px-8 rounded-xl text-lg hover:border-blue-500 hover:text-blue-600"
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>

              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className="w-56 h-56 md:w-64 md:h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="w-40 h-40 md:w-48 md:h-48 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex flex-col items-center justify-center p-6">
                    <TrendingUp className="h-12 w-12 md:h-16 md:w-16 text-white mb-4" />
                    <span className="text-white text-xl md:text-2xl font-bold">FinanceFlow</span>
                    <span className="text-white/80 text-xs md:text-sm mt-2">PWA Ready</span>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border"
                >
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-sm">Offline Mode</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-sm">Secure</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-gray-200 dark:border-gray-800 py-12"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <TrendingUp className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </div>

            <div className="text-gray-600 dark:text-gray-400 text-center md:text-right">
              <p className="text-sm">
                © 2026 FinanceFlow. All rights reserved.
              </p>
              <p className="text-sm mt-2">
                Built with Next.js, Supabase, and Tailwind CSS.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}