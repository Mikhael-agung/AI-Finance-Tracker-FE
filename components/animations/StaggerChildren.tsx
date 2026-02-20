'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { staggerContainer } from './variants'

interface StaggerChildrenProps {
    children: ReactNode
    className?: string
}

export function StaggerChildren({ children, className }: StaggerChildrenProps) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}