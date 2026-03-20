'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ComingSoonProps {
    icon: LucideIcon
    title: string
    description: string
    features?: string[]
}

export function ComingSoon({ icon: Icon, title, description, features = [] }: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center max-w-md"
            >
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-[#0da2e7]/10 border border-[#0da2e7]/20 flex items-center justify-center mb-6">
                    <Icon className="w-9 h-9 text-[#0da2e7]" />
                </div>

                {/* Badge */}
                <span className="text-xs font-semibold tracking-widest text-[#0da2e7] uppercase mb-3">
                    Segera Hadir
                </span>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-8">{description}</p>

                {/* Feature list */}
                {features.length > 0 && (
                    <div className="w-full bg-[#161b22] border border-slate-800 rounded-xl p-4 text-left space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Yang akan hadir
                        </p>
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.06 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0da2e7] shrink-0" />
                                <span className="text-sm text-slate-300">{f}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}